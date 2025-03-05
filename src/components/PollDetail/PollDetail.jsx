import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../../context/AuthContext/AuthContext';

const DetailContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1.5rem; 
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const PollInfo = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const PollTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0 0 1rem 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 2rem; 
  }

  @media (max-width: 480px) {
    font-size: 1.75rem; 
    text-align: center;
  }
`;

const PollDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 1rem;
    text-align: center;
  }
`;

const ResultsContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start; 
    gap: 0.5rem; 
  }
`;

const ResultTitle = styled.span`
  font-size: 1.1rem;
  color: #333;
  width: 150px;
  margin-right: 1.5rem;
  font-weight: 500;

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  background-color: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  height: 10px;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background-color: #3498db;
  width: ${(props) => props.percentage}%;
  border-radius: 8px;
  transition: width 0.3s ease;
`;

const PercentageText = styled.span`
  font-size: 1rem;
  color: #666;
  margin-left: 1.5rem;
  font-weight: 500;

  @media (max-width: 480px) {
    margin-left: 0;
    width: 100%; 
    text-align: right;
  }
`;

const VoteButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  margin-left: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }

  &:active {
    background: #1c6ea4;
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    margin-left: 0; 
    width: 100%;
    padding: 0.5rem;
  }
`;

const CancelButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.2s;
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};

  &:hover {
    background: #cc0000;
    transform: translateY(-2px);
  }

  &:active {
    background: #b30000;
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    width: 100%; 
    margin-top: 1rem; 
  }
`;

const WarningMessage = styled.p`
  color: #ff4d4d;
  font-size: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 2rem;
  font-weight: 500;
  position: absolute; 
  bottom: 0; 
  left: 2rem;
  right: 2rem;
  background: white; 
  padding: 0.5rem;
  border-radius: 4px; 

  @media (max-width: 480px) {
    position: static;
    margin-top: 1rem; 
  }
`;

const ChartContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column; 
    gap: 1rem;
  }
`;

const ChartWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  flex: 1;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 1.25rem; 
    text-align: center; 
  }
`;

export default function PollDetail() {
    const { pollId } = useParams();
    const { user } = useContext(AuthContext);
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    const fetchPoll = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_IP}:${import.meta.env.VITE_SERVER_PORT}/polling_api/get_poll_by_id/${pollId}/`);
            if (!response.ok) throw new Error('Ошибка при загрузке опроса');
            const data = await response.json();
            setPoll(data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Не удалось загрузить опрос');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPoll();
    }, [pollId]);

    const vote = async (optionTitle) => {
        if (!user) {
            setShowWarning(true);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_IP}:${import.meta.env.VITE_SERVER_PORT}/polling_api/vote/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poll_title: poll.title,
                    username: user.username,
                    option_title: optionTitle,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка при голосовании');
            }

            const updatedPoll = await response.json();
            setPoll(updatedPoll.poll);
            setShowWarning(false);
        } catch (err) {
            console.error('Ошибка:', err);
            setError(err.message);
        }
    };

    const cancelVote = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_IP}:${import.meta.env.VITE_SERVER_PORT}/polling_api/cancel_vote/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    poll_title: poll.title,
                    username: user.username,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка при отмене голоса');
            }

            await fetchPoll();
        } catch (err) {
            console.error('Ошибка:', err);
            setError(err.message);
        }
    };

    const hasUserVoted = () => {
        if (!poll || !user) return false;
        return poll.fields.some((field) => field.votes_list_db.includes(user.username));
    };

    if (!poll) return <p>Опрос не найден</p>;

    const totalVotes = poll.fields.reduce((sum, field) => sum + field.votes_list_db.length, 0);

    const chartData = poll.fields.map((field) => ({
        name: field.title,
        votes: field.votes_list_db.length,
    }));

    const COLORS = [
        '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#d35400'
    ];

    return (
        <DetailContainer>
            <PollInfo>
                <PollTitle>{poll.title}</PollTitle>
                <PollDescription>
                    <strong>Автор:</strong> {poll.author}
                    <br />
                    <strong>Описание:</strong> {poll.description}
                </PollDescription>
            </PollInfo>

            <ResultsContainer>
                <h2>Результаты:</h2>
                <br /> <br />
                {poll.fields.map((field) => {
                    const percentage = (field.votes_list_db.length / totalVotes) * 100 || 0;
                    return (
                        <ResultItem key={field.title}>
                            <ResultTitle>{field.title}</ResultTitle>
                            <ProgressBarContainer>
                                <ProgressBarFill percentage={percentage} />
                            </ProgressBarContainer>
                            <PercentageText>{percentage.toFixed(2)}%</PercentageText>
                            {!hasUserVoted() && (
                                <VoteButton onClick={() => vote(field.title)}>Голосовать</VoteButton>
                            )}
                        </ResultItem>
                    );
                })}
                {showWarning && (
                    <WarningMessage>Чтобы проголосовать в опросе нужно войти в аккаунт или зарегистрироваться</WarningMessage>
                )}
                <CancelButton 
                    style={{ visibility: hasUserVoted() ? 'visible' : 'hidden' }} 
                    onClick={cancelVote}
                >
                    Отменить голос
                </CancelButton>
            </ResultsContainer>
            
            <ChartContainer>
                <ChartWrapper>
                    <ChartTitle>График результатов</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="votes">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <ChartWrapper>
                    <ChartTitle>Круговая диаграмма результатов</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="votes"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </ChartContainer>
        </DetailContainer>
    );
}