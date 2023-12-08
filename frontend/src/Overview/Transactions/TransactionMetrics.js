import React, { useState, useEffect } from "react"
import { Container, Row, Col } from "react-bootstrap"
import Chart from "chart.js/auto"
import moment from "moment" // Import Moment.js

export const TransactionMetrics = ({ filteredData }) => {
    useEffect(() => {
        // Render charts when filteredData changes
        renderCharts()
    }, [filteredData])

    const renderCharts = () => {
        if (!filteredData) {
            // Handle the case where filteredData is null or undefined
            return
        }
        renderPieChart("cadPieChartByAccountType", "account_type")
        renderPieChart("cadPieChartByGroupTags", "group_tags")
        renderBarChart("cadBarChartByDate")
    }

    const renderPieChart = (chartId, groupBy) => {
        // Filter and group data
        const groupedData = groupData(filteredData, groupBy)

        // Extract labels and data for the pie chart
        const labels = Object.keys(groupedData)
        const data = Object.values(groupedData).map((group) =>
            group.reduce((total, item) => total + item.CAD, 0)
        )

        // Create a reference to the canvas element
        const ctx = document.getElementById(chartId).getContext("2d")

        // Destroy previous chart instance (if any)
        Chart.getChart(ctx)?.destroy()

        // Create a new pie chart
        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.8)",
                            "rgba(54, 162, 235, 0.8)",
                            "rgba(255, 205, 86, 0.8)",
                            "rgba(75, 192, 192, 0.8)",
                            "rgba(153, 102, 255, 0.8)",
                            "rgba(255, 159, 64, 0.8)",
                            "rgba(255, 99, 255, 0.8)",
                            "rgba(0, 255, 255, 0.8)",
                            "rgba(128, 0, 128, 0.8)",
                            "rgba(255, 0, 255, 0.8)",
                            // Add more colors as needed
                        ],
                    },
                ],
            },
            options: {
                cutout: 110, // Adjust the cutout value to control the size of the hole
            },
        })
    }

    const renderBarChart = (chartId) => {
        // Sort the data by transaction_date
        const sortedData = filteredData
            .slice()
            .sort(
                (a, b) =>
                    moment(a.transaction_date).unix() -
                    moment(b.transaction_date).unix()
            )

        // Remove the largest and smallest values
        const trimmedData = sortedData.slice(1, -1)

        // Extract labels and data for the bar chart
        const labels = trimmedData.map((item) => item.transaction_date)
        const data = trimmedData.map((item) => item.CAD)

        // Create a reference to the canvas element
        const ctx = document.getElementById(chartId).getContext("2d")

        // Destroy previous chart instance (if any)
        Chart.getChart(ctx)?.destroy()

        // Create a new bar chart
        new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "CAD",
                        data,
                        backgroundColor: "rgba(75, 192, 192, 0.8)",
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
    }

    const groupData = (data, key) => {
        if (!data) {
            return {}
        }

        return data.reduce((result, item) => {
            const groupKey = item[key]
            if (!result[groupKey]) {
                result[groupKey] = []
            }
            result[groupKey].push(item)
            return result
        }, {})
    }

    return (
        <Container>
            <Row>
                <Col lg={1}></Col>
                <Col lg={4}>
                    <canvas
                        id="cadPieChartByAccountType"
                        width="20"
                        height="20"
                    ></canvas>
                </Col>
                <Col lg={1}></Col>
                <Col lg={4}>
                    <canvas
                        id="cadPieChartByGroupTags"
                        width="20"
                        height="20"
                    ></canvas>
                </Col>
                <Col lg={1}></Col>
            </Row>
            <Row>
                <Col>
                    <canvas
                        id="cadBarChartByDate"
                        width="100"
                        height="100"
                    ></canvas>
                </Col>
            </Row>
        </Container>
    )
}
