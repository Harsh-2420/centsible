import * as React from "react"
import "../App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col } from "react-bootstrap"
import { Transactions } from "./Transactions/Transactions"
import Splitwise from "./Splitwise/Splitwise"

import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"

export const Home = () => {
    const [value, setValue] = React.useState("1")

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    return (
        <>
            <Box sx={{ width: "100%", typography: "body1" }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                        >
                            <Tab label="Transactions" value="1" />
                            <Tab label="Splitwise" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <Transactions />
                    </TabPanel>
                    <TabPanel value="2">
                        <Splitwise />
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}
