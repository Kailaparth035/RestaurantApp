import * as React from "react";
import Svg, { Path } from "react-native-svg";

const originalWidth = 69;
const originalHeight = 47;

function LogoMaster(props) {
  return (
    <Svg
      width={props.width}
      height={props.height}
      fill="none"
      viewBox={`0 0 ${originalWidth} ${originalHeight}`}
      {...props}
    >
      <Path
        fill="#fff"
        d="M0 4.678C0 2.094 2.094 0 4.678 0h58.8c2.583 0 4.677 2.094 4.677 4.678v37.326c0 2.583-2.094 4.677-4.678 4.677h-58.8C2.095 46.681 0 44.587 0 42.004V4.678z"
      />
      <Path
        fill="#231F20"
        fillRule="evenodd"
        d="M24.849 36.124v3.454h-.757v-.42c-.24.311-.605.507-1.1.507-.976 0-1.741-.759-1.741-1.814 0-1.055.765-1.814 1.741-1.814.495 0 .86.195 1.1.506v-.42h.757zm-1.763.62c-.655 0-1.056.5-1.056 1.107s.401 1.106 1.056 1.106c.627 0 1.05-.478 1.05-1.106 0-.629-.424-1.106-1.05-1.106zm27.342 1.107c0-.607.401-1.106 1.056-1.106.627 0 1.05.477 1.05 1.106 0 .628-.423 1.106-1.05 1.106-.655 0-1.056-.5-1.056-1.106zm2.82-3.114v4.841h-.758v-.42c-.24.311-.605.507-1.1.507-.976 0-1.741-.759-1.741-1.814 0-1.055.765-1.814 1.741-1.814.495 0 .86.195 1.1.506v-1.806h.758zm-19.003 1.972c.487 0 .8.304.88.838H33.32c.081-.499.386-.838.926-.838zm-1.72 1.142c0-1.077.714-1.814 1.735-1.814.975 0 1.645.737 1.653 1.814 0 .1-.008.195-.015.288h-2.585c.109.622.553.846 1.04.846.35 0 .722-.13 1.014-.36l.37.556c-.422.354-.902.484-1.426.484-1.042 0-1.785-.716-1.785-1.814zm10.875 0c0-.607.4-1.106 1.056-1.106.626 0 1.049.477 1.049 1.106 0 .628-.423 1.106-1.049 1.106-.655 0-1.056-.5-1.056-1.106zm2.818-1.727v3.454h-.757v-.42c-.24.311-.604.507-1.1.507-.975 0-1.74-.759-1.74-1.814 0-1.055.765-1.814 1.74-1.814.496 0 .86.195 1.1.506v-.42h.757zm-7.093 1.727c0 1.048.735 1.814 1.857 1.814.525 0 .874-.116 1.252-.412l-.363-.607c-.284.202-.583.31-.911.31-.605-.007-1.049-.44-1.049-1.105s.444-1.099 1.049-1.106c.328 0 .627.108.91.31l.364-.606c-.378-.296-.727-.412-1.252-.412-1.122 0-1.857.766-1.857 1.814zm8.842-1.308c.196-.303.48-.506.917-.506.154 0 .372.029.54.094l-.234.708c-.16-.065-.32-.087-.473-.087-.495 0-.743.318-.743.89v1.936h-.758v-3.454h.75v.42zm-19.374-.145c-.365-.238-.867-.361-1.42-.361-.882 0-1.45.42-1.45 1.106 0 .563.423.91 1.201 1.019l.358.05c.415.058.611.166.611.362 0 .267-.277.419-.794.419-.524 0-.902-.166-1.157-.361l-.357.584c.415.304.94.449 1.507.449 1.005 0 1.588-.47 1.588-1.128 0-.607-.458-.925-1.216-1.033l-.357-.051c-.328-.043-.59-.108-.59-.34 0-.252.247-.404.663-.404.444 0 .874.166 1.085.296l.328-.607zm8.85.145c.196-.303.48-.506.917-.506.153 0 .371.029.539.094l-.233.708c-.16-.065-.32-.087-.474-.087-.495 0-.743.318-.743.89v1.936h-.757v-3.454h.75v.42zm-5.543-.42h-1.238v-1.047h-.765v1.048h-.707v.686h.706v1.576c0 .801.314 1.279 1.21 1.279.328 0 .706-.101.946-.268l-.218-.643c-.226.13-.474.195-.67.195-.379 0-.502-.231-.502-.578v-1.56H31.9v-.687zM20.58 37.41v2.168h-.765v-1.922c0-.586-.248-.91-.764-.91-.503 0-.852.318-.852.917v1.915h-.766v-1.922c0-.586-.254-.91-.757-.91-.517 0-.852.318-.852.917v1.915h-.765v-3.454h.758v.426c.284-.404.648-.513 1.02-.513.531 0 .91.232 1.15.615.32-.485.78-.622 1.224-.615.845.008 1.37.557 1.37 1.373z"
        clipRule="evenodd"
      />
      <Path fill="#FF5F00" d="M39.814 30.254H28.342V9.798h11.472v20.456z" />
      <Path
        fill="#EB001B"
        d="M29.07 20.026c0-4.15 1.958-7.846 5.007-10.228-2.23-1.742-5.044-2.782-8.103-2.782-7.24 0-13.11 5.825-13.11 13.01 0 7.186 5.87 13.01 13.11 13.01 3.059 0 5.873-1.04 8.103-2.781-3.05-2.382-5.008-6.079-5.008-10.229z"
      />
      <Path
        fill="#F79E1B"
        d="M55.291 20.026c0 7.186-5.87 13.01-13.11 13.01-3.059 0-5.873-1.04-8.104-2.781 3.05-2.382 5.009-6.079 5.009-10.229 0-4.15-1.959-7.846-5.009-10.228 2.23-1.742 5.045-2.782 8.104-2.782 7.24 0 13.11 5.825 13.11 13.01z"
      />
      <Path
        fill="#F3F3F3"
        d="M4.678 1.17h58.8v-2.34h-58.8v2.34zm62.308 3.508v37.326h2.338V4.678h-2.338zm-3.509 40.834h-58.8v2.338h58.8v-2.338zM1.17 42.004V4.678h-2.338v37.326h2.338zm3.509 3.508c-1.938 0-3.509-1.571-3.509-3.508h-2.338c0 3.229 2.617 5.846 5.847 5.846v-2.338zm62.308-3.508c0 1.937-1.571 3.508-3.509 3.508v2.338c3.23 0 5.848-2.617 5.848-5.846h-2.34zM63.477 1.169c1.938 0 3.509 1.571 3.509 3.509h2.338c0-3.23-2.617-5.847-5.846-5.847v2.338zm-58.8-2.338c-3.229 0-5.846 2.617-5.846 5.847h2.338c0-1.938 1.571-3.509 3.509-3.509v-2.338z"
      />
    </Svg>
  );
}

const MemoLogoMaster = React.memo(LogoMaster);
export default MemoLogoMaster;