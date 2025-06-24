export interface WorkdaySettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Holiday {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
}

export interface Settings {
  projectStartDate: Date;
  workdays: WorkdaySettings;
  holidays: Holiday[];
  // Le thème n'est plus stocké ici, il est rattaché à l'utilisateur côté serveur
}
