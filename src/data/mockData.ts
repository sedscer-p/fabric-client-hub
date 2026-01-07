export interface Client {
  id: string;
  name: string;
  advisor: string;
  lastMeetingDate: string;
  email: string;
}

export interface ActionItem {
  id: string;
  text: string;
  status: 'pending' | 'complete';
  dueDate?: string;
}

export interface SummaryPoint {
  id: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ClientDocumentation {
  riskTolerance: string;
  financialObjective: string;
  capacityForLoss: string;
  investmentHorizon: string;
}

export interface MeetingNote {
  id: string;
  date: string;
  type: string;
  summary: string;
  transcription: string;
  hasAudio: boolean;
  clientActions?: ActionItem[];
  advisorActions?: ActionItem[];
}

export interface MeetingPrepItem {
  id: string;
  text: string;
  status: 'pending' | 'complete';
  fromMeetingDate: string;
}

export type ViewType = 'documentation' | 'meeting-notes' | 'meeting-prep' | 'start-meeting';

export const clients: Client[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    advisor: 'James Thompson',
    lastMeetingDate: '2024-12-15',
    email: 'sarah.mitchell@email.com',
  },
];

export const meetingTypes = [
  { id: 'discovery', label: 'Discovery Meeting' },
  { id: 'regular', label: 'Regular Review' },
  { id: 'annual', label: 'Annual Review' },
];

export const clientDocumentation: Record<string, ClientDocumentation> = {
  '1': {
    riskTolerance: 'Moderate - Willing to accept some market fluctuations for potential growth',
    financialObjective: 'Retirement income generation with capital preservation focus',
    capacityForLoss: 'Medium - Can withstand 15-20% temporary portfolio decline',
    investmentHorizon: '10-15 years until retirement, then 25+ year distribution phase',
  },
  '2': {
    riskTolerance: 'Aggressive - Comfortable with significant market volatility',
    financialObjective: 'Business exit planning and wealth accumulation',
    capacityForLoss: 'High - Can sustain 30%+ decline without lifestyle impact',
    investmentHorizon: '5 years to business exit, 30+ years for personal wealth',
  },
  '3': {
    riskTolerance: 'Conservative - Prefers stability over growth potential',
    financialObjective: 'Education funding and family financial security',
    capacityForLoss: 'Low - Requires stable portfolio value for near-term goals',
    investmentHorizon: '8 years for education goals, 25 years for retirement',
  },
};

export const meetingNotes: Record<string, MeetingNote[]> = {
  '1': [],
  '2': [],
  '3': [],
};

export const meetingPrepItems: Record<string, MeetingPrepItem[]> = {
  '1': [
    { id: '1', text: 'Follow up on updated beneficiary information for retirement accounts', status: 'pending', fromMeetingDate: '2024-12-15' },
    { id: '2', text: 'Check if estate planning documents have been signed', status: 'pending', fromMeetingDate: '2024-12-15' },
    { id: '3', text: 'Review ESG investment options presentation with client', status: 'pending', fromMeetingDate: '2024-12-15' },
    { id: '4', text: 'Confirm bond allocation rebalancing has been executed', status: 'complete', fromMeetingDate: '2024-12-15' },
  ],
  '2': [
    { id: '1', text: 'Request business valuation report from accountant', status: 'pending', fromMeetingDate: '2024-12-10' },
    { id: '2', text: 'Review succession planning roadmap draft', status: 'pending', fromMeetingDate: '2024-12-10' },
    { id: '3', text: 'Execute identified tax-loss harvesting trades', status: 'complete', fromMeetingDate: '2024-12-10' },
  ],
  '3': [
    { id: '1', text: 'Collect mortgage statements for refinance analysis', status: 'pending', fromMeetingDate: '2024-11-28' },
    { id: '2', text: 'Present 529 contribution increase proposal', status: 'pending', fromMeetingDate: '2024-11-28' },
    { id: '3', text: 'Update financial plan with new home value', status: 'complete', fromMeetingDate: '2024-11-28' },
  ],
};

export const overallTrends: Record<string, string[]> = {
  '1': [],
  '2': [],
  '3': [],
};

export const summaryPoints: Record<string, SummaryPoint[]> = {
  '1': [
    { id: '1', text: 'Discussed retirement timeline and confirmed target age of 62 for transition to part-time work' },
    { id: '2', text: 'Reviewed current portfolio allocation - agreed to increase bond holdings by 10% given market volatility' },
    { id: '3', text: 'Estate planning documents need updating after recent property purchase' },
    { id: '4', text: 'Expressed interest in ESG-focused investment options for taxable account' },
  ],
  '2': [
    { id: '1', text: 'Business succession planning discussed - targeting exit within 5 years' },
    { id: '2', text: 'Cash reserves sufficient for 18 months of operating expenses' },
    { id: '3', text: 'Tax-loss harvesting opportunities identified in growth portfolio' },
  ],
  '3': [
    { id: '1', text: 'College funding for two children remains on track with current 529 contributions' },
    { id: '2', text: 'Life insurance coverage reviewed - adequate for current family needs' },
    { id: '3', text: 'Discussed potential home refinancing given current rate environment' },
    { id: '4', text: 'Emergency fund replenished after home renovation project' },
  ],
};

export const clientActions: Record<string, ActionItem[]> = {
  '1': [
    { id: '1', text: 'Provide updated beneficiary information for retirement accounts', status: 'pending', dueDate: '2025-01-15' },
    { id: '2', text: 'Review and sign updated estate planning documents', status: 'pending', dueDate: '2025-01-20' },
    { id: '3', text: 'Complete risk tolerance questionnaire', status: 'complete' },
  ],
  '2': [
    { id: '1', text: 'Send business valuation report from accountant', status: 'pending', dueDate: '2025-01-10' },
    { id: '2', text: 'Review proposed succession timeline', status: 'complete' },
  ],
  '3': [
    { id: '1', text: 'Gather mortgage statements for refinance analysis', status: 'pending', dueDate: '2025-01-08' },
    { id: '2', text: 'Update employment information', status: 'complete' },
    { id: '3', text: 'Review 529 contribution increase proposal', status: 'pending', dueDate: '2025-01-12' },
  ],
};

export const advisorActions: Record<string, ActionItem[]> = {
  '1': [
    { id: '1', text: 'Prepare ESG investment options presentation', status: 'pending', dueDate: '2025-01-10' },
    { id: '2', text: 'Coordinate with estate attorney on document updates', status: 'pending', dueDate: '2025-01-12' },
  ],
  '2': [
    { id: '1', text: 'Research business valuation specialists', status: 'complete' },
    { id: '2', text: 'Draft preliminary succession planning roadmap', status: 'pending', dueDate: '2025-01-15' },
    { id: '3', text: 'Review tax-loss harvesting opportunities', status: 'pending', dueDate: '2025-01-08' },
  ],
  '3': [
    { id: '1', text: 'Run refinance scenarios with current rates', status: 'pending', dueDate: '2025-01-05' },
    { id: '2', text: 'Update financial plan with new home value', status: 'complete' },
  ],
};

export const chatHistory: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: '1',
      role: 'user',
      content: 'What was discussed about retirement in our last meeting?',
      timestamp: '2024-12-20T10:30:00',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'In your last meeting on December 15th, you discussed your retirement timeline with James. You confirmed your target retirement age of 62 for transitioning to part-time work. The current plan remains on track, with your portfolio projected to support this timeline assuming continued contributions at current levels.',
      timestamp: '2024-12-20T10:30:15',
    },
  ],
  '2': [],
  '3': [],
};
