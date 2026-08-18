import { Capacitor } from "@capacitor/core";

export const isMobileApp = () => {
  return Capacitor.isNativePlatform();
};

export const platform = () => {

  if(isMobileApp()){
    return "mobile";
  }

  return "web";
};