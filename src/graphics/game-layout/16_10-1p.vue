<template>
	<div>
    <div id="fillur" class="flexContainer"></div>
    <div id="fillbar" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px hideSoundIcon="true"></player-info>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px" maxUserCount="20"></discord-voice-display>
    <twitch-player id="stream1" streamIndex="0"></twitch-player>
	</div>
</template>

<script lang="ts">
	import { Component, Vue, Watch, Prop } from "vue-property-decorator";
	import { nodecg, NodeCG } from "../../browser-util/nodecg";
	import { Bingoboard, BingosyncSocket, BingoboardMeta } from "../../../schemas";
	import { store, getReplicant } from "../../browser-util/state";
  import TestTimerContainer from "../components/timerContainer.vue";
	import TestGameContainer from "../components/gameContainer.vue";
  import BingoBoard from "../components/bingoboard.vue";
  import PlayerInfo from "../components/playerInfo.vue";
  import TeamInfo from "../components/teamInfo.vue";
  import PlayerTeamContainer from "../components/playerTeamContainer.vue";
  import DiscordVoiceDisplay from "../components/discordVoiceDisplay.vue";
  import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";

	@Component({
		components: {
			BingoBoard,
      TestGameContainer,
      PlayerInfo,
      TeamInfo,
      PlayerTeamContainer,
      TestTimerContainer,
      DiscordVoiceDisplay,
      TwitchPlayer,
		}
	})

	export default class GameLayout extends Vue {
    get teams(): RunDataTeam[] {
      return store.state.runDataActiveRun.teams;
    }
	}
</script>

<style scoped>
  #fillur {
    position: absolute;
    top: 0px;
    left: 552px;
    width: 1368px;
    height: 855px;
    border: 2px var(--container-border-color) solid;
  }
  #fillbar {
    position: absolute;
    top: 1000px;
    left: 0px;
    width: 1920px;
    height: 80px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #discord-voice {
    position: absolute;
    top: 560px;
    left: 0px;
    width: 552px;
    height: 440px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #pi1 {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 537px;
  }
  #Bingo-board {
    position: absolute;
    top: 60px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 552px;
    height: 500px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 855px;
    left: 552px;
    width: 684px;
    border: 2px var(--container-border-color) solid;
    height: 145px;
  }
  #timer{
    position: absolute;
    top: 855px;
    left: 1236px;
    background-image: url("../../../static/middle-info-background.png");
    width: 684px;
    border: 2px var(--container-border-color) solid;
    height: 145px;
  }
  #stream1 {
    position: absolute;
    top: 0px;
    left: 552px;
    width: 1368px;
    height: 855px;
  }
</style>
