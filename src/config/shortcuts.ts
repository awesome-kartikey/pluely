import { ShortcutAction } from "@/types";

export const DEFAULT_SHORTCUT_ACTIONS: ShortcutAction[] = [
  {
    id: "toggle_window",
    name: "Toggle Window",
    description: "Show/Hide the main window",
    defaultKey: {
      macos: "cmd+backslash",
      windows: "ctrl+backslash",
      linux: "ctrl+backslash",
    },
  },
  {
    id: "system_audio",
    name: "System Audio",
    description: "Toggle system audio capture",
    defaultKey: {
      macos: "cmd+shift+m",
      windows: "ctrl+shift+m",
      linux: "ctrl+shift+m",
    },
  },
  {
    id: "audio_recording",
    name: "Voice Input",
    description: "Start voice recording",
    defaultKey: {
      macos: "cmd+shift+a",
      windows: "ctrl+shift+a",
      linux: "ctrl+shift+a",
    },
  },
  {
    id: "screenshot",
    name: "Screenshot",
    description: "Capture screenshot",
    defaultKey: {
      macos: "cmd+shift+s",
      windows: "ctrl+shift+s",
      linux: "ctrl+shift+s",
    },
  },
  {
    id: "toggle_system_prompt",
    name: "Toggle System Prompt",
    description: "Cycle through your saved system prompts",
    defaultKey: {
      macos: "cmd+shift+y",
      windows: "ctrl+shift+y",
      linux: "ctrl+shift+y",
    },
  },
   {
    id: "move_window_up",
    name: "Move Window Up",
    description: "Move the window up by 10 pixels",
    defaultKey: {
      macos: "cmd+alt+up",
      windows: "ctrl+alt+up",
      linux: "ctrl+alt+up",
    },
  },
  {
    id: "move_window_down",
    name: "Move Window Down",
    description: "Move the window down by 10 pixels",
    defaultKey: {
      macos: "cmd+alt+down",
      windows: "ctrl+alt+down",
      linux: "ctrl+alt+down",
    },
  },
  {
    id: "move_window_left",
    name: "Move Window Left",
    description: "Move the window left by 10 pixels",
    defaultKey: {
      macos: "cmd+alt+left",
      windows: "ctrl+alt+left",
      linux: "ctrl+alt+left",
    },
  },
  {
    id: "move_window_right",
    name: "Move Window Right",
    description: "Move the window right by 10 pixels",
    defaultKey: {
      macos: "cmd+alt+right",
      windows: "ctrl+alt+right",
      linux: "ctrl+alt+right",
    },
  },
  {
    id: "toggle_always_on_top",
    name: "Toggle Always on Top",
    description: "Toggle whether the window stays above all others",
    defaultKey: {
      macos: "cmd+alt+t",
      windows: "ctrl+alt+t",
      linux: "ctrl+alt+t",
    },
  },
  {
    id: "exit_app",
    name: "Quit App",
    description: "Quit the application",
    defaultKey: {
      macos: "cmd+shift+q",
      windows: "ctrl+shift+q",
      linux: "ctrl+shift+q",
    },
  },
  {
    id: "restart_app",
    name: "Restart App",
    description: "Restart the application after 5 seconds",
    defaultKey: {
      macos: "cmd+shift+r",
      windows: "ctrl+shift+r",
      linux: "ctrl+shift+r",
    },
  },
];
