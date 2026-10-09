import { ShortcutAction } from "@/types";

export const DEFAULT_SHORTCUT_ACTIONS: ShortcutAction[] = [
  {
    id: "toggle_dashboard",
    name: "Toggle Dashboard",
    description: "Open/Close the dashboard window",
    defaultKey: {
      macos: "cmd+shift+d",
      windows: "ctrl+shift+d",
      linux: "ctrl+shift+d",
    },
  },
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
    id: "focus_input",
    name: "Refocus Input Box",
    description: "Bring Pluely forward and place the cursor in the input area",
    defaultKey: {
      macos: "cmd+shift+i",
      windows: "ctrl+shift+i",
      linux: "ctrl+shift+i",
    },
  },
  {
    id: "move_window",
    name: "Move Window",
    description: "Move overlay with arrow keys (hold to move continuously)",
    defaultKey: {
      macos: "cmd",
      windows: "ctrl",
      linux: "ctrl",
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
    id: "exit_app",
    name: "Quit App",
    description: "Quit the application instantly",
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
