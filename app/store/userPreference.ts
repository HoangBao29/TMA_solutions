import { create } from 'zustand';

type State = {
    sessionId: string;
    favoriteGenres: string[];
    onboarded: boolean;

    setGenres: (genres: string[]) => void;
    setOnboarded: (value: boolean) => void;
    resetSession: () => void;
};

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

export const useUserPreference = create<State>()((set) => ({
    sessionId: generateSessionId(),
    favoriteGenres: [],
    onboarded: false,

    setGenres: (genres) => set({ favoriteGenres: genres }),
    setOnboarded: (value) => set({ onboarded: value }),
    resetSession: () => set({
        sessionId: generateSessionId(),
        favoriteGenres: [],
        onboarded: false
    }),
}));

