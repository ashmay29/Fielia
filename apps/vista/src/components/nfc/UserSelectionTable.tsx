"use client";

import { CardData } from "@/app/nfc-card/actions";

interface UserSelectionTableProps {
  cards: CardData[];
  selectedUuids: string[];
  onSelectionChange: (uuids: string[]) => void;
  searchQuery: string;
  formatDate: (dateString?: string) => string;
  onRowClick: (card: CardData) => void;
  onDelete: (uuid: string, e: React.MouseEvent) => void;
}

export default function UserSelectionTable({
  cards,
  selectedUuids,
  onSelectionChange,
  searchQuery,
  formatDate,
  onRowClick,
  onDelete,
}: UserSelectionTableProps) {
  const allSelected =
    cards.length > 0 && cards.every((c) => selectedUuids.includes(c.uuid));
  const someSelected =
    cards.some((c) => selectedUuids.includes(c.uuid)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(cards.map((c) => c.uuid));
    }
  };

  const toggleOne = (uuid: string) => {
    if (selectedUuids.includes(uuid)) {
      onSelectionChange(selectedUuids.filter((u) => u !== uuid));
    } else {
      onSelectionChange([...selectedUuids, uuid]);
    }
  };

  const hasNoPhone = (card: CardData) => !card.phone || card.phone.trim() === "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#C5A572]/10 border-b border-[#E1D6C7]/20">
          <tr>
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-[#E1D6C7]/30 bg-transparent accent-[#C5A572] cursor-pointer"
                aria-label="Select all users"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Sr. No.
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Address
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Preference
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Visits
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Enrolled
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              UUID
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E1D6C7]/10">
          {cards.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-8 text-center text-[#E1D6C7]/50"
              >
                {searchQuery
                  ? "No users found matching your filters"
                  : "No users enrolled yet"}
              </td>
            </tr>
          ) : (
            cards.map((card, index) => {
              const isSelected = selectedUuids.includes(card.uuid);
              const noPhone = hasNoPhone(card);

              return (
                <tr
                  key={card.uuid}
                  onClick={() => onRowClick(card)}
                  className={`hover:bg-[#E1D6C7]/5 transition-colors cursor-pointer ${
                    isSelected ? "bg-[#C5A572]/5" : ""
                  }`}
                >
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(card.uuid)}
                      className="w-4 h-4 rounded border-[#E1D6C7]/30 bg-transparent accent-[#C5A572] cursor-pointer"
                      aria-label={`Select ${card.firstName} ${card.lastName}`}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-[#E1D6C7]/70 font-mono">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {card.firstName} {card.lastName}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      {card.phone || (
                        <span className="text-[#E1D6C7]/30 italic">—</span>
                      )}
                      {noPhone && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-amber-400/80 shrink-0"
                          title="No phone number — will be skipped in bulk messaging"
                        />
                      )}
                    </span>
                  </td>
                  <td
                    className="px-4 py-4 text-sm max-w-xs truncate"
                    title={card.address}
                  >
                    {card.address}
                  </td>
                  <td
                    className="px-4 py-4 text-sm max-w-xs truncate"
                    title={card.preference}
                  >
                    {card.preference}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#E1D6C7]/70">
                    {card.scanHistory?.length || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#E1D6C7]/70">
                    {formatDate(card.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-[#E1D6C7]/50">
                    {card.uuid}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={(e) => onDelete(card.uuid, e)}
                      className="text-red-400 hover:text-red-300 hover:underline text-xs uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
