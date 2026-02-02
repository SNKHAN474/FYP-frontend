import { useEffect, useState } from "react";
import { load } from "@loaders.gl/core";

const useLoader = (file: any, loader: any) => {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setData(null);
    setErr(null);
    setIsLoading(true);

    try {
      load(file, loader).then((result: any) => {
        //console.log("loader result", result);
        setData(result);
        setIsLoading(false);
      });
    } catch (err: any) {
      setErr(err);
      setIsLoading(false);
    }
  }, [file, loader]);

  return { data, err, isLoading };
}

export default useLoader;
