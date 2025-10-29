export type TextElement = {
  id: string;
  content: string;
};

export type Frame = {
  id: string;
  name: string;
  texts: TextElement[];
};

export const initialFramesData: Frame[] = [
  {
    id: 'frame1',
    name: 'Onboarding Screen',
    texts: [
      { id: 't1-1', content: 'Welcome to Figma Translator' },
      { id: 't1-2', content: 'Select frames to get started.' },
      { id: 't1-3', content: 'Next' },
    ],
  },
  {
    id: 'frame2',
    name: 'Dashboard View',
    texts: [
      { id: 't2-1', content: 'Your Projects' },
      { id: 't2-2', content: 'Create a new project to continue.' },
      { id: 't2-3', content: 'Recent Activity' },
      { id: 't2-4', content: 'You have no recent activity.' },
    ],
  },
  {
    id: 'frame3',
    name: 'Settings Page',
    texts: [
      { id: 't3-1', content: 'Profile Settings' },
      { id: 't3-2', content: 'Username' },
      { id: 't3-3', content: 'Email Address' },
      { id: 't3-4', content: 'Change Password' },
      { id: 't3-5', content: 'Save Changes' },
    ],
  },
    {
    id: 'frame4',
    name: 'Confirmation Modal',
    texts: [
      { id: 't4-1', content: 'Are you sure?' },
      { id: 't4-2', content: 'This action cannot be undone.' },
      { id: 't4-3', content: 'Confirm' },
      { id: 't4-4', content: 'Cancel' },
    ],
  },
];
