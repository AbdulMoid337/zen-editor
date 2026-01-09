import { useEffect, useRef } from "react";

const Title = ({
  title,
  setTitle,
}: {
  title: string;
  setTitle: (e: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [title]);

  return (
    <textarea
      ref={textareaRef}
      name="title"
      rows={1}
      value={title}
      placeholder="Untitled"
      className="text-5xl w-full font-bold resize-none overflow-hidden focus:outline-none bg-transparent placeholder:text-muted-foreground/40 text-foreground"
      onChange={(e) => setTitle(e.target.value)}
    />
  );
};

export default Title;
