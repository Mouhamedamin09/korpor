export type NotificationItem = {
  id: string | number;
  description: string;
  datetime: Date; // exact moment the notification was generated
  read: boolean; // true = already seen
  type:
    | "new_property"
    | "other"
    | "exit_window"
    | "document"
    | "funding"
    | "rent";
  propertyId: string | number; // extend as needed
};
