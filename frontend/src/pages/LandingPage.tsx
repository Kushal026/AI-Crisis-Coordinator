import React, { useState } from 'react';
import { ShieldAlert, BarChart3, Users, FileText, Globe2, Zap, ArrowRight, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: ShieldAlert,
      title: 'Active Crisis Management',
      description: 'Real-time incident tracking, severity classification, and coordinated response workflows for critical situations.',
      color: 'var(--color-critical)'
    },
    {
      icon: BarChart3,
      title: 'Resource Allocation',
      description: 'Optimize corporate asset distribution across departments with intelligent allocation algorithms and live capacity monitoring.',
      color: 'var(--color-medium)'
    },
    {
      icon: Users,
      title: 'Workforce Coordination',
      description: 'Seamlessly assign personnel to projects, track availability, and manage team deployments across the organization.',
      color: 'var(--color-low)'
    },
    {
      icon: FileText,
      title: 'Audit & Reporting',
      description: 'Comprehensive analytics dashboards, resolution tracking, and management reports for full organizational oversight.',
      color: 'var(--color-high)'
    },
    {
      icon: Globe2,
      title: 'Multi-Department Support',
      description: 'Unified platform spanning all corporate departments with role-based access and cross-functional resource sharing.',
      color: 'var(--secondary)'
    },
    {
      icon: Zap,
      title: 'Instant Response',
      description: 'Sub-second crisis detection, automated escalation paths, and real-time notification systems for rapid decision making.',
      color: 'var(--primary)'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, var(--bg-secondary) 0%, var(--bg-primary) 60%)',
      overflowX: 'hidden'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <ShieldAlert size={22} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            CrisisCommand
          </span>
        </div>
        <button 
          onClick={onLoginClick}
          className="glass-btn"
          style={{ padding: '10px 24px', fontSize: '0.9rem' }}
        >
          Access Portal <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 40px 60px',
        textAlign: 'center'
      }}>
        <div className="animate-slide" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'var(--color-critical-bg)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          color: 'var(--color-critical)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--color-critical)',
            animation: 'statusPulse 2s infinite'
          }} />
          Enterprise Crisis Response Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 50%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Crisis Command Center
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Unified command and control for corporate crisis management. Coordinate resources, 
          manage incidents, and drive rapid resolution across your entire organization.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={onLoginClick}
            className="glass-btn"
            style={{ 
              padding: '16px 32px', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            Launch Portal <ArrowRight size={18} />
          </button>
          <button 
            onClick={onLoginClick}
            className="glass-btn-secondary"
            style={{ 
              padding: '16px 32px', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            View Demo <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto 80px',
        padding: '0 40px'
      }}>
        <div className="glass-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0',
          padding: '0',
          overflow: 'hidden'
        }}>
          {[
            { value: '24/7', label: 'Active Monitoring' },
            { value: '<1s', label: 'Response Time' },
            { value: '100+', label: 'Departments Supported' },
            { value: '99.9%', label: 'System Uptime' }
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '24px 32px',
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--border-primary)' : 'none',
              borderBottom: '1px solid var(--border-primary)'
            }}>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px 100px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.75px',
            marginBottom: '16px'
          }}>
            Enterprise-Grade Capabilities
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Built for organizations that demand precision, speed, and reliability in crisis response.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isHovered = hoveredFeature === i;
            return (
              <div
                key={i}
                className="glass-panel interactive-card"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: '28px',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isHovered ? feature.color : 'var(--bg-secondary)',
                  color: isHovered ? '#fff' : feature.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered ? `0 8px 20px ${feature.color}40` : 'none'
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                  letterSpacing: '-0.3px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto 100px',
        padding: '0 40px'
      }}>
        <div className="glass-panel" style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-glass) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.15)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.75px',
            marginBottom: '16px'
          }}>
            Ready to Command Your Crisis Response?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            maxWidth: '500px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}>
            Access the portal now to manage incidents, allocate resources, and coordinate your team in real-time.
          </p>
          <button 
            onClick={onLoginClick}
            className="glass-btn"
            style={{ 
              padding: '16px 40px', 
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            Access Portal <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-primary)',
        padding: '32px 40px',
        textAlign: 'center'
      }}>
        <p style={{
          color: 'var(--text-tertiary)',
          fontSize: '0.85rem',
          fontWeight: 500
        }}>
          CrisisCommand Enterprise — Corporate Crisis Resource Allocation Platform
        </p>
      </footer>
    </div>
  );
};
