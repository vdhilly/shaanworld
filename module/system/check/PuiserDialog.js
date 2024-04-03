export class PuiserDialog extends Dialog {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "templates/hud/dialog.html",
      focus: true,
      classes: ["dialog", "puiser"],
      width: 400,
      height: 217,
      jQuery: true,
    });
  }
}
