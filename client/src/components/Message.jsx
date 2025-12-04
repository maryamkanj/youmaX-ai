import React, { useEffect, useState, useRef } from "react";
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
import { jsPDF } from "jspdf";
import * as docx from "docx";
import { saveAs } from "file-saver";

const Message = ({ message }) => {
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isCopySuccess, setIsCopySuccess] = useState(false);
    const exportDropdownRef = useRef(null);

    useEffect(() => {
        // Highlight all code blocks after render
        setTimeout(() => {
            Prism.highlightAll();
        }, 100);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setIsExportDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [message.content]);

    const isUser = message.role === 'user' || message.isUser;

    // Function to copy AI text to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopySuccess(true);
            setTimeout(() => setIsCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Function to clean markdown symbols while keeping structure
    const cleanMarkdown = (text) => {
        // Remove bold markers (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');

        // Remove italic markers (*text* or _text_)
        text = text.replace(/\*(.*?)\*/g, '$1');
        text = text.replace(/_(.*?)_/g, '$1');

        // Remove headers but keep text with proper spacing
        text = text.replace(/^#\s+(.*)/gm, '$1');
        text = text.replace(/^##\s+(.*)/gm, '$1');
        text = text.replace(/^###\s+(.*)/gm, '$1');

        // Remove links but keep text
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        // Remove code blocks but keep content
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        });
        text = text.replace(/`([^`]+)`/g, '$1');

        // Remove blockquotes
        text = text.replace(/^>\s+/gm, '');

        // Remove horizontal rules
        text = text.replace(/^---$/gm, '');
        text = text.replace(/^___$/gm, '');
        text = text.replace(/^\*\*\*$/gm, '');

        // Clean up extra spaces
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

        return text;
    };

    // Function to parse content into structured format for export
    const parseContentForExport = (content) => {
        const cleanedContent = cleanMarkdown(content);
        const lines = cleanedContent.split('\n');
        const sections = [];
        let currentSection = { type: 'paragraph', lines: [] };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Check for numbered section headers (e.g., "1. Plan & Organize")
            if (/^\d+\.\s+[A-Z].*/.test(trimmedLine)) {
                if (currentSection.lines.length > 0) {
                    sections.push({ ...currentSection });
                }
                currentSection = {
                    type: 'numbered-header',
                    lines: [trimmedLine.replace(/^\d+\.\s+/, '')],
                    number: trimmedLine.match(/^\d+/)[0]
                };
            }
            // Check for bullet points
            else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || /^[a-zA-Z]+:/.test(trimmedLine)) {
                if (currentSection.type !== 'bullet' && currentSection.lines.length > 0) {
                    sections.push({ ...currentSection });
                    currentSection = { type: 'bullet', lines: [] };
                }
                currentSection.lines.push(trimmedLine);
            }
            // Check for empty line (section break)
            else if (trimmedLine === '') {
                if (currentSection.lines.length > 0) {
                    sections.push({ ...currentSection });
                    currentSection = { type: 'paragraph', lines: [] };
                }
            }
            // Regular text
            else {
                if (currentSection.type !== 'paragraph' && currentSection.lines.length > 0) {
                    sections.push({ ...currentSection });
                    currentSection = { type: 'paragraph', lines: [] };
                }
                currentSection.lines.push(trimmedLine);
            }

            // Add last section
            if (index === lines.length - 1 && currentSection.lines.length > 0) {
                sections.push({ ...currentSection });
            }
        });

        return sections;
    };

    // Function to export text as PDF with clean formatting
    const exportAsPDF = () => {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // Add YoumaX header
        doc.setFillColor(61, 0, 0); // #3D0000
        doc.rect(0, 0, pageWidth, 15, 'F');

        // Title
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("YoumaX AI Assistant", pageWidth / 2, 10, { align: 'center' });

        // Date
        doc.setFontSize(9);
        doc.setTextColor(255, 200, 200);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 16, { align: 'center' });

        yPos = 30;

        // Parse and process content
        const sections = parseContentForExport(message.content);

        // Configure base text settings
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        sections.forEach((section, sectionIndex) => {
            // Check for page break
            if (yPos > pageHeight - margin - 15) {
                doc.addPage();
                yPos = margin;
                // Add continuation header
                doc.setFillColor(61, 0, 0);
                doc.rect(0, 0, pageWidth, 10, 'F');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                doc.text("YoumaX AI - Continued", pageWidth / 2, 7, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                yPos = 15;
            }

            switch (section.type) {
                case 'numbered-header':
                    doc.setFontSize(13);
                    doc.setFont("helvetica", "bold");
                    // Add section number and header
                    const headerText = `${section.number}. ${section.lines[0]}`;
                    doc.text(headerText, margin, yPos);
                    yPos += 8;
                    // Add spacing after header
                    yPos += 2;
                    break;

                case 'bullet':
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");

                    section.lines.forEach((line, lineIndex) => {
                        // Check if we need a new page for this line
                        if (yPos > pageHeight - margin - 5) {
                            doc.addPage();
                            yPos = margin;
                            doc.setFillColor(61, 0, 0);
                            doc.rect(0, 0, pageWidth, 10, 'F');
                            doc.setFontSize(10);
                            doc.setTextColor(255, 255, 255);
                            doc.text("YoumaX AI - Continued", pageWidth / 2, 7, { align: 'center' });
                            doc.setTextColor(0, 0, 0);
                            yPos = 15;
                            doc.setFontSize(11);
                        }

                        // Add bullet point for list items
                        if (line.startsWith('- ') || line.startsWith('• ')) {
                            const bullet = '•';
                            const text = line.substring(2);
                            // Split long lines
                            const lines = doc.splitTextToSize(text, pageWidth - margin - 10);
                            doc.text(bullet, margin, yPos);
                            doc.text(lines[0], margin + 5, yPos);
                            yPos += 5;

                            // Additional lines for wrapped text
                            for (let i = 1; i < lines.length; i++) {
                                doc.text(lines[i], margin + 10, yPos);
                                yPos += 5;
                            }
                        } else {
                            // Regular text with colon (e.g., "Set Clear Goals:")
                            const lines = doc.splitTextToSize(line, pageWidth - margin - 5);
                            lines.forEach((textLine, i) => {
                                doc.text(textLine, margin + (i > 0 ? 10 : 0), yPos);
                                yPos += 5;
                            });
                        }

                        // Add spacing between bullet points
                        if (lineIndex < section.lines.length - 1) {
                            yPos += 1;
                        }
                    });
                    // Add extra spacing after bullet section
                    yPos += 3;
                    break;

                case 'paragraph':
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");

                    section.lines.forEach((line, lineIndex) => {
                        if (line.trim()) {
                            // Check for page break
                            if (yPos > pageHeight - margin - 5) {
                                doc.addPage();
                                yPos = margin;
                                doc.setFillColor(61, 0, 0);
                                doc.rect(0, 0, pageWidth, 10, 'F');
                                doc.setFontSize(10);
                                doc.setTextColor(255, 255, 255);
                                doc.text("YoumaX AI - Continued", pageWidth / 2, 7, { align: 'center' });
                                doc.setTextColor(0, 0, 0);
                                yPos = 15;
                                doc.setFontSize(11);
                            }

                            // Split long paragraphs
                            const paragraphLines = doc.splitTextToSize(line, pageWidth - (margin * 2));
                            paragraphLines.forEach(paragraphLine => {
                                doc.text(paragraphLine, margin, yPos);
                                yPos += 5;
                            });

                            // Add spacing between paragraphs
                            if (lineIndex < section.lines.length - 1) {
                                yPos += 2;
                            }
                        }
                    });
                    // Add extra spacing after paragraph section
                    yPos += 4;
                    break;
            }

            // Add spacing between sections
            if (sectionIndex < sections.length - 1) {
                yPos += 3;
            }
        });

        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont("helvetica", "italic");
        doc.text("Generated by YoumaX AI Assistant", pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Save PDF
        doc.save(`youmax-ai-response-${Date.now()}.pdf`);
        setIsExportDropdownOpen(false);
    };

    // Function to export text as Word document with clean formatting
    const exportAsWord = async () => {
        const sections = parseContentForExport(message.content);
        const paragraphs = [];

        // Add header
        paragraphs.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "YoumaX AI Response",
                        bold: true,
                        size: 28,
                        color: "3D0000",
                    }),
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );

        paragraphs.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Generated on: ${new Date().toLocaleDateString()}`,
                        size: 18,
                        color: "666666",
                    }),
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 400 },
            })
        );

        // Add content sections
        sections.forEach((section, sectionIndex) => {
            switch (section.type) {
                case 'numbered-header':
                    paragraphs.push(
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `${section.number}. ${section.lines[0]}`,
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                            spacing: { before: 300, after: 150 },
                        })
                    );
                    break;

                case 'bullet':
                    section.lines.forEach((line, lineIndex) => {
                        if (line.startsWith('- ') || line.startsWith('• ')) {
                            paragraphs.push(
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({
                                            text: `• ${line.substring(2)}`,
                                            size: 22,
                                        }),
                                    ],
                                    spacing: { before: 50, after: 0 },
                                    indent: { left: 720 },
                                })
                            );
                        } else {
                            paragraphs.push(
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({
                                            text: line,
                                            size: 22,
                                        }),
                                    ],
                                    spacing: { before: 50, after: 0 },
                                    indent: { left: 720 },
                                })
                            );
                        }
                    });
                    // Add spacing after bullet section
                    paragraphs.push(
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: '',
                                    size: 22,
                                }),
                            ],
                            spacing: { before: 100, after: 100 },
                        })
                    );
                    break;

                case 'paragraph':
                    section.lines.forEach((line, lineIndex) => {
                        if (line.trim()) {
                            paragraphs.push(
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({
                                            text: line,
                                            size: 22,
                                        }),
                                    ],
                                    spacing: { before: lineIndex === 0 ? 150 : 0, after: 100 },
                                })
                            );
                        }
                    });
                    break;
            }
        });

        // Add footer
        paragraphs.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "―".repeat(30),
                        size: 20,
                        color: "FF0000",
                    }),
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { before: 400, after: 200 },
            })
        );

        paragraphs.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "Exported from YoumaX AI Assistant",
                        size: 16,
                        color: "808080",
                        italics: true,
                    }),
                ],
                alignment: docx.AlignmentType.CENTER,
            })
        );

        const doc = new docx.Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 700,
                            right: 700,
                            bottom: 700,
                            left: 700,
                        },
                    },
                },
                children: paragraphs,
            }],
        });

        const blob = await docx.Packer.toBlob(doc);
        saveAs(blob, `youmax-ai-response-${Date.now()}.docx`);
        setIsExportDropdownOpen(false);
    };

    // Function to export text as TXT file with clean formatting
    const exportAsTXT = () => {
        const cleanedContent = cleanMarkdown(message.content);

        const content = `==================================================
                   YoumaX AI Response
==================================================

Generated: ${new Date().toLocaleDateString()}

${cleanedContent}

==================================================
Exported from YoumaX AI Assistant
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `youmax-ai-response-${Date.now()}.txt`);
        setIsExportDropdownOpen(false);
    };

    // Custom components for better Markdown rendering (for display only)
    const MarkdownComponents = {
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-white" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1 text-white" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-white/95" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1 text-white/95" {...props} />,
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-[#FF0000] pl-4 my-3 italic text-white/85 bg-[#3D0000]/30 py-2 rounded-r" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="relative my-3 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-[#1a1a1a] px-4 py-2 text-xs text-white/70 border-b border-white/10">
                        <span className="font-mono">{match[1]}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                            className="hover:text-white transition-colors text-white/70"
                        >
                            Copy
                        </button>
                    </div>
                    <pre className={`${className} m-0 !bg-[#1a1a1a] !p-4 overflow-x-auto`} {...props}>
                        <code className={className}>{children}</code>
                    </pre>
                </div>
            ) : (
                <code className="bg-[#3D0000]/50 text-white/95 px-1.5 py-0.5 rounded text-sm font-mono border border-[#FF0000]/30" {...props}>
                    {children}
                </code>
            );
        },
        a: ({ node, ...props }) => (
            <a className="text-[#FF6B6B] hover:text-[#FF0000] underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-white/15">
                <table className="min-w-full divide-y divide-white/15" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-[#3D0000]/40" {...props} />,
        th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider" {...props} />
        ),
        td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-white/95 border-t border-white/15" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-white/15" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-white/95" {...props} />,
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 message-animate`}>
            {isUser ? (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 message-bubble user'>
                        <p className="text-sm font-medium text-white message-text">{message.content}</p>
                    </div>
                    <span className="text-xs text-white/60 text-right mr-2">
                        {moment(message.timestamp).fromNow()}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 message-bubble ai relative'>
                        {/* Action buttons for AI messages */}
                        {!message.isImage && (
                            <div className="flex items-center justify-end gap-2 mb-2">
                                {/* Copy button */}
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3D0000]/50 border border-[#FF0000]/30 text-white hover:bg-[#950101]/50 hover:border-[#FF0000] transition-all duration-200"
                                    title="Copy text to clipboard"
                                >
                                    {isCopySuccess ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>

                                {/* Export dropdown */}
                                <div className="relative" ref={exportDropdownRef}>
                                    <button
                                        onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3D0000]/50 border border-[#FF0000]/30 text-white hover:bg-[#950101]/50 hover:border-[#FF0000] transition-all duration-200"
                                        title="Export as different formats"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export
                                        <svg className={`w-3 h-3 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Export dropdown menu */}
                                    {isExportDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-1 w-44 bg-[#3D0000] border border-[#FF0000]/30 rounded-lg shadow-lg z-50 overflow-hidden">
                                            <button
                                                onClick={exportAsPDF}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-[#950101]/80 transition-all duration-200 hover:pr-6 group"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Export as PDF
                                                <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={exportAsWord}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-[#950101]/80 transition-all duration-200 hover:pr-6 group border-t border-[#FF0000]/15"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Export as Word
                                                <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={exportAsTXT}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-[#950101]/80 transition-all duration-200 hover:pr-6 group border-t border-[#FF0000]/15"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Export as TXT
                                                <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {message.isImage ? (
                            <div className="rounded-lg overflow-hidden max-w-full">
                                <img
                                    src={message.content}
                                    alt="AI generated image"
                                    className="max-w-full h-auto rounded-lg border border-[#FF0000]/30"
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
                                <div className="text-xs text-white/70 text-center mt-2 italic">
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