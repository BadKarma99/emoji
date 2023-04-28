import { type AppType } from "next/app";

import { api } from "(~/)/utils/api";

import "(~/)/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider frontendApi={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} {...pageProps} >
      <Toaster 
      position="top-left"
      reverseOrder={false}
      />
    <Component {...pageProps} />
    </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
