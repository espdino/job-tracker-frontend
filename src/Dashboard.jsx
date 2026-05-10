import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "./auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("Applied");

  const token = localStorage.getItem("token");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    company: "",
    position: "",
    status: "Applied",
    notes: "",
    applied_date: "",
  });

  const [newNotes, setNewNotes] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);

  const jobsPerPage = 5;
  const [visibleCount, setVisibleCount] = useState(5);

  const paginatedJobs = jobs.slice(0, visibleCount);
  const totalPages = Math.max(1, Math.ceil(jobs.length / jobsPerPage));

  const [showStats, setShowStats] = useState(false);

  const [loading, setLoading] = useState(false);

  const monthlyData = {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, statusFilter, sort]);

  useEffect(() => {
    const maxPage = Math.ceil(jobs.length / jobsPerPage);

    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    }
  }, [jobs, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        setVisibleCount((prev) => prev + 5);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      params.append("sort", sort);

      const res = await axios.get(
        `https://job-tracker-backend-nxre.onrender.com/jobs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let data = res.data;

      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      await axios.post(
        "https://job-tracker-backend-nxre.onrender.com/jobs",
        {
          company,
          position,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // clear form
      setCompany("");
      setPosition("");
      setStatus("Applied");

      // refresh list
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to add job");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await axios.delete(
        `https://job-tracker-backend-nxre.onrender.com/jobs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job");
    }
  };

  const startEdit = (job) => {
    setEditingId(job.id);
    setEditData({
      company: job.company,
      position: job.position,
      status: job.status,
      notes: job.notes || "",
      applied_date: job.applied_date
        ? new Date(job.applied_date).toISOString().slice(0, 16)
        : "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://job-tracker-backend-nxre.onrender.com/jobs/${id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to update job");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddNote = async (job) => {
    try {
      const timestamp = new Date().toLocaleString();

      const updatedNotes =
        (job.notes || "") + `\n[${timestamp}]\n${newNotes[job.id]}\n`;

      await axios.put(
        `https://job-tracker-backend-nxre.onrender.com/jobs/${job.id}`,
        {
          notes: updatedNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNewNotes({
        ...newNotes,
        [job.id]: "",
      });

      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to add note");
    }
  };
  const statsData = [
    {
      name: "Applied",
      count: jobs.filter((job) => job.status === "Applied").length,
    },
    {
      name: "Interview",
      count: jobs.filter((job) => job.status === "Interview").length,
    },
    {
      name: "Offer",
      count: jobs.filter((job) => job.status === "Offer").length,
    },
    {
      name: "Rejected",
      count: jobs.filter((job) => job.status === "Rejected").length,
    },
  ];

  jobs.forEach((job) => {
    const month = new Date(job.applied_date).toLocaleString("default", {
      month: "short",
    });

    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const monthlyChartData = Object.entries(monthlyData).map(
    ([month, count]) => ({
      month,
      count,
    }),
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-4xl font-bold text-center">My Jobs</h2>

      <nav className="bg-white shadow-md rounded-xl p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Job Tracker</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowStats((prev) => !prev)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search company or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-lg flex-1"
        />

        {/* STATUS */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* SORT */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="company">Company A-Z</option>
        </select>
      </div>

      {showStats && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Application Statistics</h2>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-2xl font-bold mb-4">Add Job</h3>

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddJob}
        >
          Add Job
        </button>
      </div>

      {/* 🔹 JOB LIST */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 && !debouncedSearch && !statusFilter ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No jobs yet</h3>

          <p className="text-gray-500 mb-4">
            Start by adding your first job application.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Job
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-500 mb-4">
            Try changing your search or filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Clear filters
          </button>
        </div>
      ) : (
        paginatedJobs.map((job) => (
          <div key={job.id} className="bg-white p-5 rounded-xl shadow mb-4">
            {editingId === job.id ? (
              <>
                {/* 🔹 EDIT MODE */}
                <input
                  className="border p-2 rounded w-full mb-3"
                  value={editData.company}
                  onChange={(e) =>
                    setEditData({ ...editData, company: e.target.value })
                  }
                />

                <input
                  className="border p-2 rounded w-full mb-3"
                  value={editData.position}
                  onChange={(e) =>
                    setEditData({ ...editData, position: e.target.value })
                  }
                />

                <select
                  className="border p-2 rounded w-full mb-3"
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>

                <input
                  type="datetime-local"
                  className="border p-2 rounded w-full mb-3"
                  value={editData.applied_date}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      applied_date: e.target.value,
                    })
                  }
                />

                <textarea
                  className="border p-2 rounded w-full mb-3"
                  placeholder="Notes"
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                />

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleUpdate(job.id)}
                >
                  Save
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* 🔹 VIEW MODE */}
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {job.company}
                </h3>

                <p className="text-gray-600 mb-1">{job.position}</p>
                <p className="text-gray-500 text-sm mb-2">
                  Applied on:{" "}
                  {job.applied_date
                    ? new Date(job.applied_date).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Unknown"}
                </p>
                <p
                  className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3
    ${
      job.status === "Applied"
        ? "bg-blue-100 text-blue-800"
        : job.status === "Interview"
          ? "bg-yellow-100 text-yellow-800"
          : job.status === "Offer"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
    }
  `}
                >
                  {job.status}
                </p>

                <p className="font-semibold text-gray-700 mb-1">Notes</p>

                <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {job.notes || "No notes yet"}
                </pre>
                <textarea
                  placeholder="Add note..."
                  value={newNotes[job.id] || ""}
                  onChange={(e) =>
                    setNewNotes({
                      ...newNotes,
                      [job.id]: e.target.value,
                    })
                  }
                />

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleAddNote(job)}
                >
                  Add Note
                </button>

                <br />

                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => startEdit(job)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
