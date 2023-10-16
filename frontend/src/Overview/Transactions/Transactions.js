import * as React from "react"
import { format } from "date-fns"
import "../../../src/App.css"
import { useState, useEffect } from "react"
import axios from "axios"
import chroma from "chroma-js"
import { makeStyles } from "@mui/styles"
import { DataGrid } from "@mui/x-data-grid"
import { SelectableCell } from "../../../src/Components/SelectableCell"

const useStyles = makeStyles((theme) => ({
    table: {
        border: "none", // Add a border around the table
        boxShadow: "none", // Remove shadow
    },
    tableHead: {
        backgroundColor: "none", // Background color for table header
    },
    tableCell: {
        borderRight: "none", // Add a border to separate table cells
    },
}))

export const Transactions = () => {
    const classes = useStyles()

    const [transactionData, setTransactionData] = useState(null)

    function parseJsonWithNaN(jsonString) {
        try {
            // Replace occurrences of "NaN" with "null" in the JSON string
            const sanitizedJsonString = jsonString.replace(/NaN/g, "null")
            return JSON.parse(sanitizedJsonString)
        } catch (error) {
            console.error("JSON parsing error:", error)
            return null
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/")
                const data = response.data
                const jsonData = parseJsonWithNaN(data)
                setTransactionData(jsonData)
            } catch (error) {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            }
        }

        fetchData() // Call the fetchData function
    }, [])

    const handleRenderStatOff = (value, maxPos, maxNeg) => {
        const isNegative = value < 0

        const bubbleStyle = {
            borderRadius: "25px",
            width: "85px",
            height: "40px",
            textAlign: "center",
            lineHeight: "40px",
        }
        if (isNegative) {
            const percent = Math.abs(value) / Math.abs(maxNeg)
            const color = chroma.scale([
                "rgba(255, 173, 173, 0.4)",
                "rgba(255, 0, 0, 0.4)",
            ])(percent)

            bubbleStyle.backgroundColor = color.hex()
        } else {
            const percent = value / maxPos

            const color = chroma.scale([
                "rgba(173, 255, 47, 0.4)",
                "rgba(0, 128, 0, 0.4)",
            ])(percent)

            bubbleStyle.backgroundColor = color.hex()
        }

        return <div style={bubbleStyle}>{value}</div>
    }

    const formatDate = (dateString) => {
        const parsedDate = new Date(dateString)
        return format(parsedDate, "yyyy-MM-dd") // Change the format as needed
    }
    const columns = [
        // { field: "id", headerName: "ID", flex: 1, width: 120 },
        {
            field: "transaction_date",
            headerName: "Transaction Date",
            flex: 1,
            width: 120,
            valueFormatter: (params) => {
                const dateString = params.value
                return formatDate(dateString) // Format the date
            },
        },
        {
            field: "transaction_name",
            headerName: "Transaction Name",
            flex: 1,
            width: 120,
        },
        {
            field: "CAD",
            headerName: "Amount ($ CAD)",
            flex: 1,
            width: 18,
            renderCell: (params) => {
                const value = params.value
                return handleRenderStatOff(value, 200, -200)
            },
        },
        { field: "USD", headerName: "Amount ($ USD)", flex: 1, width: 120 },
        { field: "account_type", headerName: "Account", flex: 1, width: 120 },
        {
            field: "group_tags",
            headerName: "Group Tags",
            flex: 1,
            renderCell: (params) => {
                return (
                    <>
                        <SelectableCell
                            value={params.value}
                            options={[
                                "Uncategorized",
                                "Restaurants",
                                "Bills",
                                "Income",
                                "Entertainment",
                                "Miscellaneous",
                                "Groceries",
                                "Travel",
                            ]}
                            onUpdate={(newValue) =>
                                handleTagUpdate(params.id, newValue)
                            }
                        />
                    </>
                )
            },
        },
    ]
    const handleTagUpdate = (id, newValue) => {
        // Send a POST request to update the data in your backend
        // You can use fetch or an HTTP library like axios
        const dataToUpdate = {
            id, // The unique identifier of the row
            group_tags: newValue, // The new group tag value
        }
        console.log(dataToUpdate)
        // Update the data source (rows) with the new value
        const updatedRows = transactionData.map((row) => {
            if (row.id === id) {
                // Update the specific row with the new value
                return { ...row, group_tags: newValue }
            }
            return row
        })
        setTransactionData(updatedRows)

        axios
            .post("/group_tags_update", dataToUpdate)
            .then((response) => {
                console.log("Server response:", response.data)
            })
            .catch((error) => {
                console.error("Error:", error)
            })
        // TODO: Make the POST request and handle the response
        // ...
    }

    return (
        <>
            {transactionData ? (
                <>
                    {/* <div style={{ height: "100%", width: "100%" }}> */}
                    <DataGrid
                        sx={{
                            fontFamily: "Futura",
                            border: 0,
                            boxShadow: 0,
                            "& .MuiDataGrid-cell:hover": {
                                // color: "",
                                fontWeight: "900",
                            },
                        }}
                        rows={transactionData}
                        columns={columns}
                        autoHeight={true}
                        rowHeight={70}
                        className="custom-datagrid"
                    />
                    {/* </div> */}
                </>
            ) : (
                <></>
            )}
        </>
    )
}
