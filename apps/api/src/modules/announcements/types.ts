export interface AnnouncementCreatePayload {
  title: string;
  content: string;
  isActive?: boolean;
  targetRoles?: string[];
  authorId: string;
}

export interface AnnouncementUpdatePayload {
  title?: string;
  content?: string;
  isActive?: boolean;
  targetRoles?: string[];
}

export interface AnnouncementIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  authorId?: string;
  targetRole?: string;
}

export interface AnnouncementShowWhere {
  uuid: string;
}


export interface Announcement {
  id: number;
  uuid: string;
  title: string;
  content: string;
  isActive: boolean,
  targetRoles: string[],
  createdAt: Date,
  updatedAt: Date,
  author: {
    uuid: string,
    user: {
      firstName: string,
      lastName: string,
      email: string,
    },
  },
}