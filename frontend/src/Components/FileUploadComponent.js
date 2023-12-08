// FileUploadComponent.js

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import CheckCircleIcon from "@mui/icons-material/CheckCircle" // Import the green tick icon
import axios from "axios"

const FileUploadComponent = ({ onUploadSuccess }) => {
    const navigate = useNavigate()
    const [amex_file, setAmexFile] = useState(null)
    const [rbc_file, setRbcFile] = useState(null)
    const [splitwise_file, setSplitwiseFile] = useState(null)

    const handleAmexFileChange = (event) => {
        const selectedFile = event.target.files[0]
        setAmexFile(selectedFile)
    }

    const handleRbcFileChange = (event) => {
        const selectedFile = event.target.files[0]
        setRbcFile(selectedFile)
    }
    const handleSplitwiseFileChange = (event) => {
        const selectedFile = event.target.files[0]
        setSplitwiseFile(selectedFile)
    }

    const handleUpload = async () => {
        // if (!amex_file || !rbc_file || !splitwise_file) {
        //     console.error("Please select both files before uploading.")
        //     return
        // }
        const formData = new FormData()
        formData.append("amex", amex_file)
        formData.append("splitwise", splitwise_file)
        formData.append("rbc", rbc_file)
        try {
            // Use the FormData directly in your axios or fetch request to send it to Flask
            const response = await axios.post(
                "http://127.0.0.1:5000/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            // Handle the response as needed
            console.log("Files uploaded successfully | React", response.data)
            // Notify the parent component (Home.js) about the successful upload
            // onUploadSuccess()
            console.log(
                "Upload Success Called: Data should be updated soon! | React"
            )
            navigate("/home")
        } catch (error) {
            console.error("Error uploading files:", error)
        }
    }

    return (
        <div className="file-upload-container">
            {/* File 1 */}
            <input
                type="file"
                onChange={handleAmexFileChange}
                className="file-upload-input"
                id="amex_file"
            />
            <label htmlFor="amex_file">
                <Button
                    variant="contained"
                    component="span"
                    id="file-upload-button"
                    endIcon={
                        amex_file && (
                            <CheckCircleIcon style={{ color: "green" }} />
                        )
                    }
                >
                    {amex_file ? `${amex_file.name}` : "Select Amex csv"}
                </Button>
            </label>
            <br />

            {/* File 2 */}
            <input
                type="file"
                onChange={handleRbcFileChange}
                className="file-upload-input"
                id="rbc_file"
            />
            <label htmlFor="rbc_file">
                <Button
                    variant="contained"
                    component="span"
                    id="file-upload-button"
                    endIcon={
                        rbc_file && (
                            <CheckCircleIcon style={{ color: "green" }} />
                        )
                    }
                >
                    {rbc_file ? `${rbc_file.name}` : "Select RBC csv"}
                </Button>
            </label>
            <br />

            {/* File 3 */}
            <input
                type="file"
                onChange={handleSplitwiseFileChange}
                className="file-upload-input"
                id="splitwise_file"
            />
            <label htmlFor="splitwise_file">
                <Button
                    variant="contained"
                    component="span"
                    id="file-upload-button"
                    endIcon={
                        splitwise_file && (
                            <CheckCircleIcon style={{ color: "green" }} />
                        )
                    }
                >
                    {splitwise_file
                        ? `${splitwise_file.name}`
                        : "Select Splitwise csv"}
                </Button>
            </label>
            <br />

            {/* Upload Button */}
            {/* amex_file === null || rbc_file === null ?  */}
            {amex_file === null ? (
                <></>
            ) : (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        id="file-upload-button-final"
                    >
                        Upload Files
                    </Button>
                </>
            )}
        </div>
    )
}

export default FileUploadComponent
