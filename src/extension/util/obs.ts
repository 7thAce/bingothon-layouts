import obsWebsocketJs from 'obs-websocket-js';
import * as nodecgApiContext from './nodecg-api-context';
import { Configschema } from '../../../configschema';
import { ObsAudioSources, ObsConnection } from '../../../schemas';

// this module is used to communicate directly with OBS
// and transparently handle:
//  - audio volume/mute/delay
//  - preview and current scene
//  - transitions

const nodecg  = nodecgApiContext.get();
const logger = new nodecg.Logger(`${nodecg.bundleName}:obs`);
const bundleConfig = nodecg.bundleConfig as Configschema;

// Extending the OBS library with some of our own functions.
class OBSUtility extends obsWebsocketJs {
	constructor() {
		super();
	}

	/**
	 * Change to this OBS scene.
	 * @param name Name of the scene.
	 */
	changeScene(name: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.send('SetCurrentScene', { 'scene-name': name }).then(resolve).catch((err) => {
				logger.warn(`Cannot change OBS scene [${name}]: ${err.error}`);
				reject();
			});
		});
	}

	/**
	 * Get the Volume for a source
	 * @param source Name of the source which volume should be changed
	 */
	getAudioVolume(source: string): Promise<number> {
		return new Promise((resolve, reject) => {
			this.send("GetVolume", {source}).then(resp => {
				resolve(resp.volume);
			}).catch(err => {
				reject(err);
			})
		});
	}

	/**
	 * Set volume for a source
	 * @param source Source which volume is changed
	 * @param volume Volume from 0.0 to 1.0 (inclusive)
	 */
	setAudioVolume(source: string, volume: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.send("SetVolume", {source, volume}).then(resolve).catch(err => {
				// logger.warn(`Cannot set volume [${source}]: ${err.error}`);
				reject(err);
			})
		});
	}
}

const obsConnectionRep = nodecg.Replicant<ObsConnection>('obsConnection');

const obs = new OBSUtility();

if (bundleConfig.obs && bundleConfig.obs.enable) {
	// local values to make sure there is no update loop

	const obsAudioSourcesRep = nodecg.Replicant<ObsAudioSources>('obsAudioSources');
	const obsPreviewSceneRep = nodecg.Replicant<string | null>('obsPreviewScene', {defaultValue: null});
	const obsCurrentSceneRep = nodecg.Replicant<string | null>('obsCurrentScene', {defaultValue: null});
	const obsSceneListRep = nodecg.Replicant<obsWebsocketJs.Scene[] | null>('obsSceneList', {defaultValue: null});

	const settings = {
		address: bundleConfig.obs.address,
		password: bundleConfig.obs.password,
	};
	logger.info('Setting up OBS connection.');
	obsConnectionRep.value.status = "disconnected";

	function connect() {
		obs.connect(settings).then(() => {
			logger.info('OBS connection successful.');
			obsConnectionRep.value.status = "connected";

			// we need studio mode
			obs.send("EnableStudioMode").catch(e => {
				logger.error("Can't set studio mode", e);
			});

			// default if they somehow not exist
			[bundleConfig.obs.discordAudio, bundleConfig.obs.mpdAudio, bundleConfig.obs.streamsAudio].forEach(audioSource => {
				if (!Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(audioSource)) {
					obsAudioSourcesRep.value[audioSource] = {volume: 0.5, muted: false, delay: 0};
				}
			});

			obs.send("GetPreviewScene").then(scene => {
				obsPreviewSceneRep.value = scene.name;
				logger.info('init update preview scene');
			}).catch(err => {
				logger.warn(`Cannot get preview scene: ${err.error}`);
			});

			obs.send("GetCurrentScene").then(scene => {
				obsCurrentSceneRep.value = scene.name;
				logger.info('init current scene');
			}).catch(err => {
				logger.warn(`Cannot get current scene: ${err.error}`);
			});

			obs.send("GetSceneList").then(sceneList => {
				obsSceneListRep.value = sceneList.scenes;
			}).catch(err => {
				logger.warn(`Cannot get current scene list: ${err.error}`);
			});
		}).catch((err) => {
			logger.warn('OBS connection error.');
			logger.debug('OBS connection error:', err);
		});
	}
	connect();
	obs.on('ConnectionClosed', () => {
		logger.warn('OBS connection lost, retrying in 5 seconds.');
		obsConnectionRep.value.status = "error";
		setTimeout(connect, 5000);
	});

	// @ts-ignore: Pretty sure this emits an error.
	obs.on('error', (err) => {
		logger.warn('OBS connection error.');
		logger.debug('OBS connection error:', err);
		obsConnectionRep.value.status = "error";
	});

	/* Don't actually care if something changes on OBS, since everything should be handled over this
	obs.on("SourceVolumeChanged", data => {
		const sourceName = data.sourceName;
		if (Object.getOwnPropertyNames(obsAudioSourcesRep.value).includes(sourceName)) {
			if 
			obsAudioSourcesRep.value[sourceName].volume = data.volume;
		}
		if (sourceName == bundleConfig.obs.discordAudio) {
			obsDiscordSoundRep.value.volume = data.volume;
		} else if (sourceName == bundleConfig.obs.mpdAudio) {
			obsMpdSoundRep.value.volume = data.volume;
		} else if (sourceName == bundleConfig.obs.streamsAudio) {
			obsStreamsSoundRep.value.volume = data.volume;
		}
	});

	obs.on("SourceMuteStateChanged", data => {
		const sourceName = data.sourceName;
		if (sourceName == bundleConfig.obs.discordAudio) {
			obsDiscordSoundRep.value.muted = data.muted;
		} else if (sourceName == bundleConfig.obs.mpdAudio) {
			obsMpdSoundRep.value.muted = data.muted;
		} else if (sourceName == bundleConfig.obs.streamsAudio) {
			obsStreamsSoundRep.value.muted = data.muted;
		}
	})*/

	obs.on("PreviewSceneChanged", data => {
		obsPreviewSceneRep.value = data["scene-name"];
	});

	obs.on("SwitchScenes", data => {
		obsCurrentSceneRep.value = data["scene-name"];
	});

	obs.on("ScenesChanged", () => {
		obs.send("GetSceneList").then(sceneList => {
			obsSceneListRep.value = sceneList.scenes;
		}).catch(err => {
			logger.warn(`Cannot get current scene list: ${err.error}`);
		});
	});

	obsAudioSourcesRep.on('change', (newVal, old) => {
		if (old === undefined || newVal == null || newVal == old) {
			return;
		}
		Object.entries(newVal).forEach(([source, sound]) => {
			const oldSound = old[source];
			if (!oldSound || oldSound.volume != sound.volume) {
				obs.setAudioVolume(source, sound.volume).catch(e => {
					logger.warn(`Error setting Volume for [${source}] to ${sound.volume}: ${e.error}`);
				});
			}
			if (!oldSound || oldSound.muted != sound.muted) {
				obs.send("SetMute", {source: source, mute: sound.muted}).catch(e => {
					logger.warn(`Error setting mute for [${source}] to ${sound.muted}: ${e.error}`);
				});
			}
			if (!oldSound || oldSound.delay != sound.delay) {
				obs.send("SetSyncOffset", {source, offset: sound.delay * 1000000}).catch(e => {
					logger.warn(`Error setting audio delay for [${source}] to ${sound.delay}ms: ${e.error}`);
				});
			}
		});
	});

	obsPreviewSceneRep.on('change', (newVal, old) => {
		if (old === undefined || newVal == null || newVal == old) {
			return;
		}
		obs.send("SetPreviewScene",{"scene-name":newVal}).catch(e => {
			logger.warn(`Error setting preview scene to ${newVal}: ${e.error}`);
		})
	});
	
	nodecg.listenFor('obs:transition', (_data, callback) => {
		logger.info('transitioning...');
		nodecg.sendMessage('obs:startingTransition', {scene: obsPreviewSceneRep.value});
		obs.send("TransitionToProgram", {}).then(() => {
			if (callback && !callback.handled) {
				logger.info('transitioned!')
				callback();
			}
		}).catch(e => {
			logger.warn('error during transition:',e);
			if (callback && !callback.handled) {
				callback(e);
			}
		})
	});
} else {
	logger.warn('OBS is disabled');
	obsConnectionRep.value.status = "disabled";
}


export default obs;
