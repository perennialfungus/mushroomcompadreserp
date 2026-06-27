declare module "bwip-js" {
  export type ToSvgOptions = {
    bcid: string;
    text: string;
    scale?: number;
    includetext?: boolean;
    padding?: number;
    height?: number;
  };

  const bwipjs: {
    toSVG(options: ToSvgOptions): string;
  };

  export default bwipjs;
}
