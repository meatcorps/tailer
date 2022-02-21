export abstract class HandleLoadWindowBase {
  protected get isServeEnabled(): boolean {
    const publicArgs = process.argv.slice(1);
    return publicArgs.some(val => val === '--serve');
  }
}
