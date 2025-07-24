import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Spin, Alert, Divider } from 'antd';
import { UserOutlined, CrownOutlined, TagOutlined, StarOutlined } from '@ant-design/icons';
import { env } from '../config/env';
const { Title, Text } = Typography;

interface UserData {
  tagsCovered: string[];
  paidUser: boolean;
  validTill: Date | null;
  rating: number;
}

interface User {
  id: number;
  email: string;
  userData: UserData | null;
  firstName: string;
  lastName: string;
}

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${env.API_MAIN}/user`,{
            credentials: "include",
        });
        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <div className="user-dashboard">
        <div className="user-header" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div className="user-avatar" style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20
            }}>
              <UserOutlined style={{ fontSize: 40, color: '#fff' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0 }}>{`${user.firstName} ${user.lastName}`}</Title>
              <Text type="secondary">{user.email}</Text>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <Text strong>User ID:</Text> {user.id}
            </div>
            <div>
              <Text strong>Status:</Text> {user.userData?.paidUser ? (
                <Tag icon={<CrownOutlined />} color="gold">Premium Member</Tag>
              ) : (
                <Tag>Free Member</Tag>
              )}
            </div>
            <div>
              <Text strong>Rating:</Text> {user.userData?.rating || 0} <StarOutlined style={{ color: '#faad14' }} />
            </div>
          </div>
        </div>

        <Divider orientation="left">Account Details</Divider>
        
        <div className="user-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          <Card title="Membership" bordered={false}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Type: </Text>
              {user.userData?.paidUser ? 'Premium' : 'Free'}
            </div>
            <div>
              <Text strong>Valid Till: </Text>
              {user.userData?.validTill ? new Date(user.userData.validTill).toLocaleDateString() : 'N/A'}
            </div>
          </Card>

          <Card title="Tags Covered" bordered={false}>
            {user.userData?.tagsCovered && user.userData.tagsCovered.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.userData.tagsCovered.map((tag, index) => (
                  <Tag key={index} icon={<TagOutlined />} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No tags covered yet</Text>
            )}
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>User Dashboard</Title>
      {renderUserInfo()}
    </div>
  );
};

export default UserDashboard;