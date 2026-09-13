import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'ne' | 'mni' | 'lus' | 'kha' | 'gar';

interface AppState {
  isLoading: boolean;
  hasHydrated: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;

  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  isLanguageConfigured: boolean;
  setIsLanguageConfigured: (status: boolean) => void;

  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;

  location: LocationCoordinates | null;
  setLocation: (loc: LocationCoordinates | null) => void;

  riskScore: number;
  setRiskScore: (score: number) => void;

  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;

  voiceUri: string | null;
  setVoiceUri: (uri: string | null) => void;

  resetIncident: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: true,
      hasHydrated: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      isLanguageConfigured: false,
      setIsLanguageConfigured: (status) => set({ isLanguageConfigured: status }),

      phoneNumber: null,
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),

      location: null,
      setLocation: (loc) => set({ location: loc }),

      riskScore: 35,
      setRiskScore: (score) => set({ riskScore: score }),

      photoUri: null,
      setPhotoUri: (uri) => set({ photoUri: uri }),

      voiceUri: null,
      setVoiceUri: (uri) => set({ voiceUri: uri }),

      resetIncident: () => set({ photoUri: null, voiceUri: null }),
      logout: () =>
        set({
          phoneNumber: null,
          isLanguageConfigured: false,
          photoUri: null,
          voiceUri: null,
          location: null,
        }),
    }),
    {
      name: 'rakshak-app-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        isLanguageConfigured: state.isLanguageConfigured,
        phoneNumber: state.phoneNumber,
        photoUri: state.photoUri,
        voiceUri: state.voiceUri,
        location: state.location,
        riskScore: state.riskScore,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);