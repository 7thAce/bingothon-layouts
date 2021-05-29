/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface TwitchChatBotData {
  state: "disconnected" | "connecting" | "connected" | "error";
  deactivated: boolean;
  commands: {
    name: string;
    text: string;
    cooldown: number;
    lastUsed: number;
    enabled: boolean;
    commandList: string;
  }[];
}