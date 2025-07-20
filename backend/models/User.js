import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Temporairement true pour permettre la synchronisation
    validate: {
      len: [8, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE
  },
  profileImage: {
    type: DataTypes.STRING
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
    withResetToken: {
      attributes: { include: ['resetPasswordToken', 'resetPasswordExpires'] },
    },
  },
});

// Méthode pour comparer les mots de passe
User.prototype.isValidPassword = async function(password) {
  console.log('isValidPassword called with password type:', typeof password);
  console.log('this.password type:', typeof this.password);
  console.log('this.password value:', this.password);
  console.log('this.dataValues:', this.dataValues);
  
  // Essayer de récupérer le hash du mot de passe
  let passwordHash = this.password;
  
  // Si this.password n'est pas défini, essayer dataValues
  if (!passwordHash && this.dataValues && this.dataValues.password) {
    passwordHash = this.dataValues.password;
    console.log('Using password from dataValues:', typeof passwordHash);
  }
  
  // Si le hash est null ou undefined, l'utilisateur n'a pas de mot de passe
  if (!passwordHash) {
    console.log('User has no password hash stored');
    return false;
  }
  
  if (typeof passwordHash !== 'string') {
    console.error('Password hash is not a string:', {
      type: typeof passwordHash,
      value: passwordHash,
      hasDataValues: !!this.dataValues,
      dataValuesKeys: this.dataValues ? Object.keys(this.dataValues) : 'none'
    });
    throw new Error('Hash de mot de passe invalide : attendu une string, reçu ' + typeof passwordHash);
  }
  
  return await bcrypt.compare(password, passwordHash);
};

// Méthode pour obtenir le nom complet
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

export default User;
