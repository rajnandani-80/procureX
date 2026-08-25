import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteService } from '../../services/procurementService.js';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Lock, User } from 'lucide-react';

export const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      inviteService
        .validateToken(token)
        .then((res) => {
          if (res.invite) {
            setInvite(res.invite);
            setName(res.invite.name);
          }
        })
        .catch((err) => {
          setError(err.message || 'Invitation link is invalid or expired.');
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await inviteService.acceptInvite({
        token: token!,
        password,
        name
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 text-[#EAEAEA] font-sans">
      <div className="w-full max-w-md bg-[#111114] border border-[#26262B] rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] flex items-center justify-center text-black shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#EAEAEA]">ProcureX Onboarding</h1>
            <p className="text-xs text-[#88888E]">Complete your user setup</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#88888E]">Verifying invitation token...</div>
        ) : error && !invite ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-sm mb-1">Invitation Expired or Invalid</div>
              <p>{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-3 text-xs font-semibold text-[#D4AF37] hover:underline cursor-pointer"
              >
                Return to Sign In →
              </button>
            </div>
          </div>
        ) : success ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Account Created Successfully!</h3>
            <p className="text-xs text-[#88888E]">Your account is now activated. Redirecting you to login screen...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-[#16161A] border border-[#26262B] rounded-xl text-xs space-y-1">
              <div className="text-[#88888E]">Invited Organization:</div>
              <div className="text-sm font-bold text-white">{invite.organizationName}</div>
              <div className="text-[#D4AF37] font-semibold pt-1 uppercase">Role: {invite.role.replace(/_/g, ' ')}</div>
              <div className="text-[#88888E]">Email: {invite.email}</div>
            </div>

            {error && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#88888E] mb-1">Your Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#66666E] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#88888E] mb-1">Set Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#66666E] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-[#0A0A0C] border border-[#26262B] rounded-xl text-xs text-[#EAEAEA] placeholder-[#66666E] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#B89830] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {submitting ? 'Setting up...' : 'Activate Account & Join Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
