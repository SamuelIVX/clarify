/**
 * Reusable upload/status card that renders caller-provided icon, title, and
 * description for pre-selection and selected-file states.
 */
import { FileUploadProps } from "./types";

export default function FileUpload({ title, description, icon }: FileUploadProps) {
    return (
        <div>
            {icon}
            <div>
                <p className="text-lg font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-1">
                    {description}
                </p>
            </div>
        </div>
    )
}
