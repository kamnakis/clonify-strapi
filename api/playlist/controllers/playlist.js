'use strict';
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
  * Create a new playlist
  *
  * @param {*} ctx The Request Context
  */
  async addSong(ctx) {
    const { id } = ctx.params;
    
    let entity;
    
    // Find the playlist matching the ID and the user
    const [playlist] = await strapi.services.playlist.find({
      id: ctx.params.id,
      'author.id': ctx.state.user.id,
    });
    
    if (!playlist) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const [songEntity] = await strapi.services.song.find({
      id: ctx.params.songId
    });
  
    if (!songEntity) {
      throw new Error('Song does not exist.')
    }
    
    // Update the playlist
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      const alreadyExists = playlist.songs.find(song => song.id === songEntity.id)
      if (!alreadyExists) {
        playlist.songs.push(songEntity.id)
        data.songs = playlist.songs
      }
      entity = await strapi.services.playlist.update({ id }, data, {
        files,
      });
    } else {
      const alreadyExists = playlist.songs.find(song => song.id === songEntity.id)
      if (!alreadyExists) {
        playlist.songs.push(songEntity)
        ctx.request.body.songs = playlist.songs
      }
      entity = await strapi.services.playlist.update({ id }, ctx.request.body);
    }
    
    return sanitizeEntity(entity, { model: strapi.models.playlist });
  },

  /**
  * Create a new playlist
  *
  * @param {*} ctx The Request Context
  */
  async create(ctx) {
    ctx.request.body.author = ctx.state.user.id;
    let entity = await strapi.services.playlist.create(ctx.request.body);
    return sanitizeEntity(entity, { model: strapi.models.playlist });
  },

  /**
  * Update a playlist
  *
  * @param {*} ctx the request context
  */
  async update(ctx) {
    const { id } = ctx.params;
    
    let entity;
    
    // Find the playlist matching the ID and the user
    const [playlist] = await strapi.services.playlist.find({
      id: ctx.params.id,
      'author.id': ctx.state.user.id,
    });
    
    if (!playlist) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    
    // Update the playlist
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.playlist.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.playlist.update({ id }, ctx.request.body);
    }
    
    return sanitizeEntity(entity, { model: strapi.models.playlist });
  },

  /**
  * Find user's playlists
  *
  * @param {*} ctx the request context
  */
  async findUser(ctx) {
    let entities;
    
    if (ctx.query._q) {
      entities = await strapi.services.playlist.search({
        ...ctx.query,
        'author.id': ctx.state.user.id
      }, ['author', 'songs', 'songs.file', 'songs.artist', 'songs.artist.profile_image']);
    } else {
      entities = await strapi.services.playlist.find({
        ...ctx.query,
        'author.id': ctx.state.user.id
      }, ['author', 'songs', 'songs.file', 'songs.artist', 'songs.artist.profile_image']);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.playlist }));
  },

  /**
  * Find all public playlists
  *
  * @param {*} ctx the request context
  */
  async findPublic(ctx) {
    let entities;
    
    if (ctx.query._q) {
      entities = await strapi.services.playlist.search({
        ...ctx.query,
        'private': false
      }, ['author', 'songs', 'songs.file', 'songs.artist', 'songs.artist.profile_image']);
    } else {
      entities = await strapi.services.playlist.find({
        ...ctx.query,
        'private': false
      }, ['author', 'songs', 'songs.file', 'songs.artist', 'songs.artist.profile_image']);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.playlist }));
  },

  /**
  * Find a playlist
  *
  * @param {*} ctx the request context
  */
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.playlist.findOne({
      id, 
    }, ['author', 'songs', 'songs.file', 'songs.artist', 'songs.artist.profile_image']);

    if (!entity) {
      throw new Error('Playlist not found!')
    }

    if (entity && entity.private && entity.author.id !== ctx.state.user.id) {
      return ctx.unauthorized(`You can't view this entry`);
    }
    
    return sanitizeEntity(entity, { model: strapi.models.playlist });
  },

  /**
  * Delete a record
  *
  * @param {*} ctx the request context
  */
  async delete(ctx) {
    const [playlist] = await strapi.services.playlist.find({
      id: ctx.params.id,
      "author.id": ctx.state.user.id,
    });
    
    if (!playlist) {
      return ctx.unauthorized(`You can't delete this entry`);
    }
    
    let entity = await strapi.services.playlist.delete({ id: ctx.params.id });
    return sanitizeEntity(entity, { model: strapi.models.playlist });
  }
};
