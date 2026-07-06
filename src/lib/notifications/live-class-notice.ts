interface LiveClassNoticeInput {
  programSlug: string;
  title: string;
  date: string;
  time: string;
  trainerName: string;
}

/** WhatsApp class notices disabled — students join from portal only. */
export async function notifyStudentsOfLiveClass(_input: LiveClassNoticeInput): Promise<void> {
  return;
}
