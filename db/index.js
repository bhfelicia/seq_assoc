const { Sequelize, DataTypes, Model, UUID, UUIDV4 } = require("sequelize");

const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/seq_assoc_db"
);

class Department extends Model {}

Department.init(
  {
    name: {
      type: DataTypes.STRING(20),
    },
  },
  { sequelize: db, modelName: "departments" }
);

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    name: {
      type: DataTypes.STRING(20),
    },
  },
  { sequelize: db, modelName: "employees" }
);

Department.belongsTo(Employee, { as: "manager" });
Employee.hasMany(Department, { foreignKey: "managerId" });

Employee.belongsTo(Employee, { as: "supervisor" });
Employee.hasMany(Employee, { foreignKey: "supervisorId", as: "supervisees" });

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [moe, lucy, larry] = await Promise.all([
    Employee.create({ name: "moe" }),
    Employee.create({ name: "lucy" }),
    Employee.create({ name: "larry" }),
  ]);
  const [hr, engineering] = await Promise.all([
    Department.create({ name: "hr" }),
    Department.create({ name: "engineering" }),
  ]);

  hr.managerId = lucy.id;
  await hr.save();
  moe.supervisorId = lucy.id;
  larry.supervisorId = lucy.id;
  await Promise.all([moe.save(), larry.save()]);
};

module.exports = {
  db,
  syncAndSeed,
  model: {
    Employee,
    Department,
  },
};
