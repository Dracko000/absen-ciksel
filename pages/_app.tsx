import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import useServiceWorker from "@/hooks/useServiceWorker";

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker();

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
