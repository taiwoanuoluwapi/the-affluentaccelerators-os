import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart,
  Filter,
  Plus
} from 'lucide-react';
import { ConsultantProfile, ConsultantSpecialisation } from '../../types';

export const TeamDirectory: React.FC = () => {
  const { consultants, updateConsultantAvailability, users, projects, currentUser } = useApp();

  const [specialisationFilter, setSpecialisationFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);

  const filteredConsultants = consultants.filter(c => {
    const matchesSpec =
      specialisationFilter === 'all' ||
      c.specialisations.includes(specialisationFilter as ConsultantSpecialisation);

    const matchesAvail =
      availabilityFilter === 'all' || c.availabilityStatus === availabilityFilter;

    return matchesSpec && matchesAvail;
  });

  const availableCount = consultants.filter(c => c.availabilityStatus === 'available').length;
  const busyCount = consultants.filter(c => c.availabilityStatus === 'busy').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">Consultant Directory & Workload</h2>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold border border-purple-300">
              Capacity Management
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor consultant specialisations, active engagement load, and assign engagements fairly
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{availableCount} Available</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{busyCount} Active on Projects</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          <select
            value={specialisationFilter}
            onChange={e => setSpecialisationFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Specialisations</option>
            <option value="Business Strategy">Business Strategy</option>
            <option value="Financial Analysis">Financial Analysis</option>
            <option value="Operations">Operations</option>
            <option value="Market Research">Market Research</option>
            <option value="Process Improvement">Process Improvement</option>
            <option value="Sales Strategy">Sales Strategy</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={e => setAvailabilityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Availability Statuses</option>
            <option value="available">Available for New Projects</option>
            <option value="busy">Assigned / Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Consultant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredConsultants.map(cst => {
          const isAvailable = cst.availabilityStatus === 'available';

          return (
            <div
              key={cst.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={cst.avatar}
                    alt={cst.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900">{cst.fullName}</h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {cst.experienceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold">{cst.title}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{cst.email}</span>
                      <span>• {cst.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Availability Toggle */}
                <select
                  value={cst.availabilityStatus}
                  onChange={e => updateConsultantAvailability(cst.id, e.target.value as any)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy / Active</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                {cst.bio}
              </p>

              {/* Workload Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">Current Workload Utilisation</span>
                  <span className="font-bold text-slate-800 font-mono">{cst.currentWorkloadScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cst.currentWorkloadScore > 80
                        ? 'bg-rose-500'
                        : cst.currentWorkloadScore > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cst.currentWorkloadScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Specialisations Tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Core Specialisations & Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cst.specialisations.map(s => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      {s}
                    </span>
                  ))}
                  {cst.skills.slice(0, 3).map(sk => (
                    <span
                      key={sk}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Track Record Stats */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Projects: <strong className="text-slate-800">{cst.activeProjectsCount}</strong></span>
                <span>Completed Engagements: <strong className="text-slate-800">{cst.completedProjectsCount}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
