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
      className="text-7xl w-full font-bold resize-none overflow-hidden focus:outline-none"
      onChange={(e) => setTitle(e.target.value)}
    />
  );
};

export default Title;
