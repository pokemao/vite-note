// 相比于README.md中的代码加上了一个namespace，否则ts的插件总是报错
namespace doNotShowError {
  interface ViteOptionsInterface {
    input?: string;
    output?: OupPutInterface;
  }

  const defineConfig = (options: ViteOptionsInterface): ViteOptionsInterface =>
    options;
}
