import React, { useEffect } from "react";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-bash";

const Message = ({ message }) => {
    useEffect(() => {
        // Highlight all code blocks after render
        setTimeout(() => {
            Prism.highlightAll();
        }, 100);
    }, [message.content]);

    const isUser = message.role === 'user' || message.isUser;

    // Custom components for better Markdown rendering
    const MarkdownComponents = {
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-white" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1 text-white" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-white/90" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1 text-white/90" {...props} />,
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-[#FF0000] pl-4 my-3 italic text-white/80 bg-[#3D0000]/20 py-2 rounded-r" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="relative my-3 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-[#1a1a1a] px-4 py-2 text-xs text-white/60 border-b border-white/10">
                        <span className="font-mono">{match[1]}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                            className="hover:text-white transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                    <pre className={`${className} m-0 !bg-[#1a1a1a] !p-4 overflow-x-auto`} {...props}>
                        <code className={className}>{children}</code>
                    </pre>
                </div>
            ) : (
                <code className="bg-[#3D0000]/50 text-white/90 px-1.5 py-0.5 rounded text-sm font-mono border border-[#FF0000]/20" {...props}>
                    {children}
                </code>
            );
        },
        a: ({ node, ...props }) => (
            <a className="text-[#FF6B6B] hover:text-[#FF0000] underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-[#3D0000]/30" {...props} />,
        th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider" {...props} />
        ),
        td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-white/90 border-t border-white/10" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-white/10" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-white/90" {...props} />,
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 message-animate`}>
            {isUser ? (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 bg-gradient-to-r from-[#3D0000] to-[#950101] border border-[#FF0000]/30 rounded-2xl rounded-tr-none'>
                        <p className="text-sm font-medium text-white">{message.content}</p>
                    </div>
                    <span className="text-xs text-white/60 text-right mr-2">
                        {moment(message.timestamp).fromNow()}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 bg-[#3D0000]/50 border border-[#FF0000]/30 rounded-2xl rounded-tl-none'>
                        {message.isImage ? (
                            <div className="rounded-lg overflow-hidden max-w-full">
                                <img
                                    src={message.content}
                                    alt="AI generated image"
                                    className="max-w-full h-auto rounded-lg border border-[#FF0000]/20"
                                    style={{
                                        maxWidth: '400px',
                                        height: 'auto',
                                        display: 'block',
                                        margin: '0 auto'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x400/3D0000/FFFFFF?text=Image+Not+Found";
                                    }}
                                    loading="lazy"
                                />
                                <div className="text-xs text-white/60 text-center mt-2 italic">
                                    AI generated image
                                </div>
                            </div>
                        ) : (
                            <div className="text-white reset-tw max-w-full overflow-hidden">
                                <Markdown components={MarkdownComponents}>
                                    {message.content}
                                </Markdown>
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-white/60 ml-2">
                        {moment(message.timestamp).fromNow()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Message;