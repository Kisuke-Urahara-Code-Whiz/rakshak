import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'ne' | 'mni' | 'lus' | 'kha' | 'gar';

export type UserRole = 'Citizen' | 'MDoNER Employee' | 'Zonal Admin' | 'District Admin';

interface AppState {
  isLoading: boolean;
  hasHydrated: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;

  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  isLanguageConfigured: boolean;
  setIsLanguageConfigured: (status: boolean) => void;

  // Role and Session Authentication
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;

  employeeId: string | null;
  setEmployeeId: (id: string | null) => void;

  userName: string | null;
  setUserName: (name: string | null) => void;

  department: string | null;
  setDepartment: (dept: string | null) => void;

  token: string | null;
  setToken: (token: string | null) => void;

  setSession: (session: {
    role: UserRole;
    identifier?: string;
    name?: string;
    department?: string;
    token?: string;
  }) => void;

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

      userRole: 'Citizen',
      setUserRole: (role) => set({ userRole: role }),

      phoneNumber: null,
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),

      employeeId: null,
      setEmployeeId: (id) => set({ employeeId: id }),

      userName: null,
      setUserName: (name) => set({ userName: name }),

      department: null,
      setDepartment: (dept) => set({ department: dept }),

      token: null,
      setToken: (token) => set({ token }),

      setSession: (session) =>
        set({
          userRole: session.role,
          phoneNumber: session.role === 'Citizen' ? session.identifier || null : null,
          employeeId: session.role !== 'Citizen' ? session.identifier || null : null,
          userName: session.name || null,
          department: session.department || null,
          token: session.token || null,
          isLanguageConfigured: true,
        }),

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
          userRole: 'Citizen',
          phoneNumber: null,
          employeeId: null,
          userName: null,
          department: null,
          token: null,
          isLanguageConfigured: false,
          photoUri: null,
          voiceUri: null,
          location: null,
          riskScore: 35,
        }),
    }),
    {
      name: 'rakshak-app-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        isLanguageConfigured: state.isLanguageConfigured,
        userRole: state.userRole,
        phoneNumber: state.phoneNumber,
        employeeId: state.employeeId,
        userName: state.userName,
        department: state.department,
        token: state.token,
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