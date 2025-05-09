import React from 'react';
import { Container, Row, Col, Card, Alert, Form, Button, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NoAccess from '../LandingPages/NoAccess';
import BottomNav from './BottomNav';
import LoadingPage from '../LandingPages/LoadingPage';
import { useEffect } from 'react';
import api from '../../api';
import { useState } from 'react';
import Sidebar from './Sidebar';
import PortfolioChart from './PortfolioChart';

export default function PortfolioSimulator() {
    const { user, error, loading } = useAuth(); 
    const [userName, setUserName] = useState<string>(user?.email?.split('@')[0] || 'User');
    const [errorPage, setErrorPage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [portfolioData, setPortfolioData] = useState(null);
    const [portfolioError, setPortfolioError] = useState('');
    const [formData, setFormData] = useState({
        amount: 1000,
        tickers: ["AAPL", "MSFT"],
        allocations: { "AAPL": 50, "MSFT": 50 },
        start_date: "2010-01-01",
        end_date: "2025-01-01",
    });
    const [availableTickers, setAvailableTickers] = useState<string[]>(['MSFT', 'AAPL']);
    const [tickerFetchError, setTickerFetchError] = useState<string>('');

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const response = await api.get('simulations/tickers');  // 🔁 Update this endpoint name if needed
                setAvailableTickers(response.data); // assuming it returns a list like ["AAPL", "MSFT", "GOOG"]
            } catch (err) {
                setTickerFetchError("Unable to load ticker options.");
            }
        };
        console.log(availableTickers);
        fetchTickers();
    }, []);

    console.log(portfolioData);
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const idToken = await user.getIdToken(true);
                const response = await api.post(
                    '/simulations/simulate-portfolio', 
                    formData, 
                    {headers: {Authorization: `Bearer ${idToken}`}});
                setPortfolioData(response.data);
            } catch (err) {
                setPortfolioError("Could not load investment data.");
            }
        };
        fetchPortfolio();
    }, []);

    useEffect(() => {
        const fetchUserName = async () => {
            setIsLoading(true);
            try {
                const idToken = await user?.getIdToken(true);
                const response = await api.get(`/users/`, {headers: {Authorization: `Bearer ${idToken}`}});
                setUserName(response.data.first_name);
            } catch (err) {
                setUserName(user?.email?.split('@')[0] || 'User');
                setErrorPage(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchUserName();
        }
    }, [user]);

    // Utility to create cumulative returns for chart
    const buildCumulativeChartData = (returns: number[]) => {
        let cumulative = 0;
        return returns.map((r, i) => {
            cumulative += r;
            return {
                date: `Day ${i + 1}`,
                value: cumulative
            };
        });
    };

    const handleSimulate = async () => {
        try {
            // Post 
            const idToken = await user.getIdToken(true);
            const response = await api.post(
                '/simulations/simulate-portfolio', 
                formData, 
                {headers: {Authorization: `Bearer ${idToken}`}});
            if (response.status < 200 || response.status >= 300) {
                throw new Error("Failed to simulate portfolio.");
            }
            setPortfolioData(response.data);
        }catch(error){
            const err = error as Error;
            console.error("Error submitting form:", err.message);
            setPortfolioError(err.message);
        }
    };
    
    const handleSave = async () => {
        try {
            // Save the Portfolio Simulation
            const idToken = await user.getIdToken(true);
            const response = await api.put('/simulations/simulate-porfolio', formData, {headers: {Authorization: `Bearer ${idToken}`}});
            if (response.status < 200 || response.status >= 300) {
                throw new Error("Failed to save user info.");
            }
        }catch(error){
            const err = error as Error;
            console.error("Error submitting form:", err.message);
            setPortfolioError(err.message);
        }
    };

    if (!user && !isLoading && !loading) {
        return <NoAccess />;
    }

    if (isLoading || loading) {
        return <LoadingPage />;
    }
    return (
        <Container className="my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row>
                {/* Sidebar for desktop */}
                <Col xs={12} md={3} className="d-none d-md-block p-0">
                    <Sidebar />
                </Col>
                {/* Main content area */}
                <Col xs={12} md={9} className="p-4">
                <h2 className="mb-4">Welcome back, {userName}!</h2>
                {/* {error &&<Alert variant='danger'>{error}</Alert>}
                {errorPage &&<Alert variant='danger'>{errorPage}</Alert>}
                {portfolioError && <Alert variant="danger">{portfolioError}</Alert>} */}
                <Form className="mb-4">
            <Form.Group controlId="formAmount" className="mb-3">
                <Form.Label>Initial Investment ($)</Form.Label>
                <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
            </Form.Group>

            <Form.Group controlId="addTicker" className="mb-3">
                <Form.Label>Add a Ticker</Form.Label>
                <Form.Select
                    onChange={(e) => {
                        const selected = e.target.value;
                        if (!formData.tickers.includes(selected)) {
                            const newTickers = [...formData.tickers, selected];
                            const newAllocations = { ...formData.allocations, [selected]: 0 };
                            setFormData({ ...formData, tickers: newTickers, allocations: newAllocations });
                        }
                    }}>
                <option value="">-- Select Ticker --</option>
                {availableTickers
                    // .filter((t) => !formData.tickers.includes(t))
                    .map((ticker) => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            {formData.tickers.map((ticker) => (
                <Row key={ticker} className="align-items-center mb-3">
                    <Col md={6}>
                        <Form.Label>{ticker} Allocation: {formData.allocations[ticker]}%</Form.Label>
                        <Form.Range
                            min={0}
                            max={100}
                            value={formData.allocations[ticker]}
                            onChange={(e) => {
                                const updated = { ...formData.allocations, [ticker]: Number(e.target.value) };
                                setFormData({ ...formData, allocations: updated });
                            }}
                        />
                    </Col>
                    <Col md={2}>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                const newTickers = formData.tickers.filter(t => t !== ticker);
                                const newAllocations = { ...formData.allocations };
                                delete newAllocations[ticker];
                                setFormData({ ...formData, tickers: newTickers, allocations: newAllocations });
                            }}
                        >
                            Remove
                        </Button>
                    </Col>
                </Row>
            ))}

            {Object.values(formData.allocations).reduce((a, b) => a + b, 0) !== 100 && (
                <Alert variant="warning">
                    ⚠️ Allocations must total 100%. Current total: {Object.values(formData.allocations).reduce((a, b) => a + b, 0)}%
                </Alert>
            )}

            <Form.Group controlId="formStartDate" className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
            </Form.Group>

            <Form.Group controlId="formEndDate" className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
            </Form.Group>

            <div className="d-flex gap-3">
                <Button variant="primary" onClick={() => handleSimulate()}>Simulate</Button>
                <Button variant="secondary" onClick={() => handleSave()}>Save Simulation</Button>
            </div>
        </Form>


        {portfolioData && (
            <>
                <h4 className="mt-4">💼 Portfolio Summary</h4>
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <p><strong>Initial Investment:</strong> ${portfolioData.initial_investment.toFixed(2)}</p>
                        <p><strong>Final Value:</strong> ${portfolioData.total_return.toFixed(2)}</p>
                        <p><strong>Percent Gain:</strong> {portfolioData.percent_gain.toFixed(2)}%</p>
                        <p><strong>Volatility:</strong> {portfolioData.portfolio_std.toFixed(4)}</p>
                        <p><strong>Sharpe Ratio:</strong> {portfolioData.portfolio_sharpe.toFixed(2)}</p>
                    </Card.Body>
                </Card>
                {portfolioData && portfolioData.combined_returns && (
                    <PortfolioChart
                        data={buildCumulativeChartData(portfolioData.combined_returns)}
                        title="📈 Portfolio Cumulative Returns"
                    />
                )}

                <h5>📈 Ticker Breakdown</h5>
                <Row>
                    {portfolioData.results.map((item, idx) => (
                        <Col md={6} key={idx} className="mb-3">
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <h3 className='text-center text-dark'>{item.ticker}</h3>
                                    <p>Start Price: ${item.start_price.toFixed(2)}</p>
                                    <p>End Price: ${item.end_price.toFixed(2)}</p>
                                    <p>Return: {item.percent_return.toFixed(2)}%</p>
                                    <p>Volatility: {item.volatility.toFixed(4)}</p>
                                    <p>Sharpe Ratio: {item.sharpe_ratio.toFixed(2)}</p>
                                    <p>Max Drawdown: {(item.max_drawdown * 100).toFixed(2)}%</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </>
        )}
        </Col>
        </Row>

            
            <BottomNav/>
        </Container>
    );
}
