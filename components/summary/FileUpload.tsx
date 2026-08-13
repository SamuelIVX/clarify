/**
 * Reusable upload/status card that renders caller-provided icon, title, and
 * description for pre-selection and selected-file states, including selected
 * file name and size when those are passed in the description.
 */
import { FileUploadProps } from "./types";

/**
 * Presentational upload/status card driven by caller-supplied copy and icon.
 * @param title - Primary status line.
 * @param description - Secondary status / file metadata line.
 * @param icon - Leading icon node.
 * @returns The upload status card body.
 */
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
