/** Temporary preview investigation. Does not change the required musical mapping. */
@component
export class KeyboardInputProbe extends BaseScriptComponent {
  @input
  @hint("Diagnostic only: request the supported text-entry session to test punctuation callbacks")
  requestTextEntry: boolean = false;
  private previous: Record<string, boolean> = {};
  onAwake(): void {
    this.createEvent("KeyPressEvent").bind(e => {
      print("[KeyboardProbe] PRESS " + JSON.stringify({key:e.key, type:typeof e.key, modifiers:e.modifiers}));
    });
    this.createEvent("KeyReleaseEvent").bind(e => {
      print("[KeyboardProbe] RELEASE " + JSON.stringify({key:e.key, type:typeof e.key, modifiers:e.modifiers}));
    });
    this.createEvent("OnStartEvent").bind(() => {
      print("[KeyboardProbe] READY " + JSON.stringify(Keys));
      if (this.requestTextEntry) {
        require("LensStudio:TextInputModule");
        const options = new TextInputSystem.KeyboardOptions();
        options.initialText = "";
        options.enablePreview = true;
        options.keyboardType = TextInputSystem.KeyboardType.Text;
        options.onTextChanged = (text, range) => print("[KeyboardProbe] TEXT " + JSON.stringify({text, range}));
        options.onKeyboardStateChanged = open => print("[KeyboardProbe] TEXT_OPEN " + open);
        options.onError = (code, message) => print("[KeyboardProbe] TEXT_ERROR " + code + " " + message);
        options.onCommitText = (text, cursor) => print("[KeyboardProbe] COMMIT " + JSON.stringify({text,cursor}));
        global.textInputSystem.requestKeyboard(options);
      }
      // Unsupported candidates are diagnostics only, never musical key definitions.
      for (const value of [",", "Comma", 44, 188]) {
        try { print("[KeyboardProbe] CANDIDATE " + JSON.stringify(value) + " => " + KeyboardManager.isKeyPressed(value as unknown as Keys)); }
        catch(e) { print("[KeyboardProbe] REJECTED " + JSON.stringify(value) + " => " + String(e)); }
      }
    });
    this.createEvent("UpdateEvent").bind(() => {
      for (const value of [Keys.B, Keys.L, Keys.M, Keys.Invalid, 44, 188]) {
        try {
          const down = KeyboardManager.isKeyPressed(value as Keys);
          const id = String(value);
          if (down !== !!this.previous[id]) print("[KeyboardProbe] POLL " + id + "=" + down);
          this.previous[id] = down;
        } catch(e) { /* invalid candidates reported once at start */ }
      }
    });
  }
}
