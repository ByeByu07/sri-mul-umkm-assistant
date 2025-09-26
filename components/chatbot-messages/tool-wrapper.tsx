import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { ToolUIPart } from "ai";

export const ToolWrapper = ({ part, index, loadingText, OutputComponent, outputProps = {} }: {
    part: ToolUIPart;
    index: number;
    loadingText: string;
    OutputComponent: React.ComponentType<any>;
    outputProps?: any;
}) => {
    switch (part.state) {
        case 'input-available':
            return (
                <div key={index} className="w-full flex justify-start">
                    <div className="flex items-center gap-2 w-fit max-w-[80%] mr-auto">
                        <Spinner className="text-blue-500" size={24} /> {loadingText}
                    </div>
                </div>
            );
        case 'output-available':
            return (
                <div key={index} className="w-full flex justify-start">
                    <div className="w-full max-w-[80%] mr-auto overflow-x-auto">
                        <OutputComponent {...part.output} {...outputProps} />
                    </div>
                </div>
            );
        case 'output-error':
            return (
                <div key={index} className="w-full flex justify-start">
                    <div className="w-fit max-w-[80%] mr-auto break-words">Error: {part.errorText}</div>
                </div>
            );
        default:
            return null;
    }
};