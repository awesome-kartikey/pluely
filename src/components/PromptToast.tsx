import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PromptToastProps {
  message: string;
  show: boolean;
  duration?: number;
}

export const PromptToast = ({
  message,
  show,
  duration = 2000, // Show for 2 seconds
}: PromptToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, message, duration]); // Reruns when a new message is shown

  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg transition-all duration-300 ease-in-out
      ${
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-[100%]"
      }`}
    >
      <InfoIcon className="h-5 w-5 text-primary" />
      <div className="flex flex-col">
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};