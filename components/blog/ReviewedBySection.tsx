'use client';

export interface ReviewedBySectionProps {
  reviewedBy?: {
    name: string;
    designation: string;
  };
}

export default function ReviewedBySection({ reviewedBy }: ReviewedBySectionProps) {
  if (!reviewedBy || !reviewedBy.name || !reviewedBy.designation) {
    return null;
  }

  return (
    <div className="my-8 pt-6 border-t">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Reviewed By
      </p>
      <p className="text-sm text-gray-700">
        {reviewedBy.name} - {reviewedBy.designation}
      </p>
    </div>
  );
}
