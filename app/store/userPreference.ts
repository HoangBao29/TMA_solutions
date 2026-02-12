import { create } from 'zustand';

type State = {
    sessionId: string;
    favoriteGenres: string[];
    ratings: Record<string, number>;
    onboarded: boolean;

    setGenres: (genres: string[]) => void;
    rateMovie: (movieId: string, rating: number) => void;
    setOnboarded: (value: boolean) => void;
    resetSession: () => void;
};

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

export const useUserPreference = create<State>()((set) => ({
    sessionId: generateSessionId(),
    favoriteGenres: [],
    ratings: {},
    onboarded: false,

    setGenres: (genres) => set({ favoriteGenres: genres }),
    rateMovie: (id, rating) =>
        set((s) => ({ ratings: { ...s.ratings, [id]: rating } })),
    setOnboarded: (value) => set({ onboarded: value }),
    resetSession: () => set({
        sessionId: generateSessionId(),
        favoriteGenres: [],
        ratings: {},
        onboarded: false
    }),
}));

