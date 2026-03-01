"use client";

import { Spinner } from "./spinner";

interface Props {
  className?: string;
  children: React.ReactNode;
}

const Loading: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner className="text-primary" />
        {children}
      </div>
    </div>
  );
};

export default Loading;
