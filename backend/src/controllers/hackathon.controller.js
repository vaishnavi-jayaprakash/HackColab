import prisma from "../lib/prisma.js";
// =====================================
// CREATE HACKATHON
// =====================================

const createHackathon = async (req, res) => {
  try {
    const {
      name,
      description,
      organizerName,
      startDate,
      endDate,
      submissionDeadline,
      status,
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Name, start date and end date are required",
      });
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        name,
        description,
        organizerName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        submissionDeadline: submissionDeadline
          ? new Date(submissionDeadline)
          : null,
        status: status || "UPCOMING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      data: {
        hackathon,
      },
    });
  } catch (error) {
    console.error("Create hackathon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create hackathon",
    });
  }
};

// =====================================
// GET ALL HACKATHONS
// =====================================

const getHackathons = async (req, res) => {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: {
        startDate: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        hackathons,
      },
    });
  } catch (error) {
    console.error("Get hackathons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hackathons",
    });
  }
};

// =====================================
// GET SINGLE HACKATHON
// =====================================

const getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await prisma.hackathon.findUnique({
      where: {
        id,
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        deadlines: true,
      },
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        hackathon,
      },
    });
  } catch (error) {
    console.error("Get hackathon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hackathon",
    });
  }
};

export {
  createHackathon,
  getHackathons,
  getHackathonById,
};