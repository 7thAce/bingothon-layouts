<template>
	<div>
		<twitch-player id="stream1" streamIndex="0"></twitch-player>
		<twitch-player id="stream2" streamIndex="1"></twitch-player>
    <div id="fillbar" class="flexContainer"></div>
    <player-info id="pi1" playerIndex="0" height=45px></player-info>
    <player-info id="pi2" playerIndex="1" height=45px></player-info>
		<test-game-container id="game"></test-game-container>
    <test-timer-container id="timer"></test-timer-container>
    <bingo-board id="Bingo-board" fontSize="30px"></bingo-board>
    <discord-voice-display id="discord-voice" iconHeight="40px" nameWidth="114px" maxUserCount="7"></discord-voice-display>
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
  import { RunDataPlayer, RunDataTeam } from "../../../speedcontrol-types";
  import TwitchPlayer from "../components/twitchStreamPlaceholder.vue";

	@Component({
		components: {
			BingoBoard,
      TestGameContainer,
      PlayerInfo,
      TeamInfo,
      PlayerTeamContainer,
      TestTimerContainer,
      DiscordVoiceDisplay,
			TwitchPlayer
		}
	})

	export default class GameLayout extends Vue {
    get teams(): RunDataTeam[] {
      return store.state.runDataActiveRun.teams;
    }
	}
</script>

<style scoped>
  #stream1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 960px;
    height: 600px;
    border: 2px var(--container-border-color) solid;
  }
  #stream2 {
    position: absolute;
    top: 0px;
    left: 960px;
    width: 960px;
    height: 600px;
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
    top: 660px;
    left: 1280px;
    width: 250px;
    height: 340px;
    background-image: url("../../../static/middle-info-background.png");
    border: 2px var(--container-border-color) solid;
  }
  #pi1 {
    position: absolute;
    top: 600px;
    left: 0px;
    border: 2px var(--container-border-color) solid;
    width: 625px;
  }
  #pi2 {
    position: absolute;
    top: 600px;
    left: 1280px;
    border: 2px var(--container-border-color) solid;
    width: 625px;
  }
  #Bingo-board {
    position: absolute;
    top: 600px;
    left: 640px;
    border: 2px var(--container-border-color) solid;
    width: 638px;
    height: 400px;
  }
  #game {
    background-image: url("../../../static/middle-info-background.png");
    position: absolute;
    top: 660px;
    left: 0px;
    width: 640px;
    border: 2px var(--container-border-color) solid;
    height: 340px;
  }
  #timer{
    position: absolute;
    top: 660px;
    left: 1530px;
    background-image: url("../../../static/middle-info-background.png");
    width: 390px;
    border: 2px var(--container-border-color) solid;
    height: 340px;
  }
</style>
