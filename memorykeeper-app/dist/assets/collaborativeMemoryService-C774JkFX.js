import{s as r,o as f,d as p}from"./game-components-DlDolkYV.js";import{b as d}from"./index-BYmrHuMl.js";const g=async(t,e,o="view",s,i)=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{data:a}=await r.auth.getUser();if(!a.user)throw new Error("User not authenticated");const{data:n}=await f(a.user.id);if(!(n==null?void 0:n.find(m=>m.id===t)))throw new Error("Memory not found or access denied");const u={memory_id:t,shared_by_user_id:a.user.id,shared_with_user_ids:[e],permission_level:o,message:s?d(s):void 0,expires_at:i==null?void 0:i.toISOString(),created_at:new Date().toISOString()},{data:_,error:l}=await r.from("memory_shares").insert([u]).select().single();if(l)throw l;return await p(a.user.id,{type:"memory_shared",timestamp:new Date,value:8,metadata:{memoryId:t}}),{success:!0,shareId:_.id}}catch(a){return console.error("Error sharing memory:",a),{success:!1,error:a.message}}},v=async t=>{if(!r)return{data:null,error:"Supabase not configured"};try{const{data:e,error:o}=await r.from("memory_shares").select(`
        id,
        memory_id,
        shared_by_user_id,
        permission_level,
        message,
        created_at,
        expires_at,
        memories (
          id,
          prompt,
          response,
          date,
          type,
          tags,
          user_id
        ),
        profiles!memory_shares_shared_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `).eq("shared_with_user_ids",t).eq("is_active",!0).is("expires_at",null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);return{data:e,error:o}}catch(e){return console.error("Error fetching shared memories:",e),{data:null,error:e}}},h=async t=>{if(!r)return{data:null,error:"Supabase not configured"};try{const{data:e,error:o}=await r.from("memory_shares").select(`
        id,
        memory_id,
        shared_with_user_ids,
        permission_level,
        message,
        created_at,
        expires_at,
        memories (
          id,
          prompt,
          response,
          date,
          type,
          tags
        )
      `).eq("shared_by_user_id",t).eq("is_active",!0);return{data:e,error:o}}catch(e){return console.error("Error fetching shared memories:",e),{data:null,error:e}}},w=async t=>{if(!r)return{data:[],error:"Supabase not configured"};if(t.length===0)return{data:[],error:null};try{const{data:e,error:o}=await r.from("memories").select("*").in("id",t);return{data:e??[],error:o}}catch(e){return console.error("Error fetching memories by IDs:",e),{data:[],error:e}}},b=async(t,e,o=!1)=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{data:s}=await r.auth.getUser();if(!s.user)throw new Error("User not authenticated");const i={title:d(t),description:e?d(e):void 0,owner_id:s.user.id,collaborators:[s.user.id],permissions:{[s.user.id]:"admin"},shared_memories:[],is_public:o,created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{data:a,error:n}=await r.from("collaborative_collections").insert([i]).select().single();if(n)throw n;return{success:!0,collectionId:a.id}}catch(s){return console.error("Error creating collaborative collection:",s),{success:!1,error:s.message}}},y=async(t,e,o="view",s)=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{data:i}=await r.auth.getUser();if(!i.user)throw new Error("User not authenticated");const{data:a}=await r.from("collaborative_collections").select("permissions").eq("id",t).eq("owner_id",i.user.id).single();if(!a||a.permissions[i.user.id]!=="admin")throw new Error("Insufficient permissions to invite users");const{data:n}=await r.from("profiles").select("id").eq("email",e.toLowerCase()).single(),c=new Date;c.setDate(c.getDate()+7);const u={collection_id:t,invited_by_user_id:i.user.id,invited_user_email:e.toLowerCase(),invited_user_id:n==null?void 0:n.id,permission_level:o,status:"pending",message:s?d(s):void 0,expires_at:c.toISOString(),created_at:new Date().toISOString()},{data:_,error:l}=await r.from("collaboration_invites").insert([u]).select().single();if(l)throw l;return{success:!0,inviteId:_.id}}catch(i){return console.error("Error inviting user to collection:",i),{success:!1,error:i.message}}},S=async t=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{data:e}=await r.auth.getUser();if(!e.user)throw new Error("User not authenticated");const{data:o}=await r.from("collaboration_invites").select("collection_id, permission_level, invited_user_id").eq("id",t).eq("invited_user_id",e.user.id).eq("status","pending").single();if(!o)throw new Error("Invite not found or already processed");await r.from("collaboration_invites").update({status:"accepted"}).eq("id",t);const{data:s}=await r.from("collaborative_collections").select("collaborators, permissions").eq("id",o.collection_id).single();if(s){const i=[...s.collaborators,e.user.id],a={...s.permissions,[e.user.id]:o.permission_level};await r.from("collaborative_collections").update({collaborators:i,permissions:a,updated_at:new Date().toISOString()}).eq("id",o.collection_id)}return{success:!0}}catch(e){return console.error("Error accepting collaboration invite:",e),{success:!1,error:e.message}}},E=async t=>{if(!r)return{data:null,error:"Supabase not configured"};try{const{data:e,error:o}=await r.from("collaboration_invites").select(`
        id,
        collection_id,
        invited_by_user_id,
        invited_user_email,
        invited_user_id,
        permission_level,
        status,
        message,
        expires_at,
        created_at,
        collaborative_collections (
          title
        ),
        inviter:profiles!collaboration_invites_invited_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `).eq("invited_by_user_id",t).order("created_at",{ascending:!1});return{data:e,error:o}}catch(e){return console.error("Error fetching invites sent by user:",e),{data:null,error:e}}},q=async(t,e)=>{var o;if(!r)return{data:null,error:"Supabase not configured"};try{const s=((o=e==null?void 0:e.toLowerCase)==null?void 0:o.call(e))??"",i=new Date().toISOString(),a=[];if(t&&a.push(`invited_user_id.eq.${t}`),s&&a.push(`invited_user_email.eq.${s}`),a.length===0)return{data:[],error:null};const{data:n,error:c}=await r.from("collaboration_invites").select(`
        id,
        collection_id,
        invited_by_user_id,
        invited_user_email,
        invited_user_id,
        permission_level,
        status,
        message,
        expires_at,
        created_at,
        collaborative_collections (
          title
        ),
        inviter:profiles!collaboration_invites_invited_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `).or(a.join(",")).eq("status","pending").gte("expires_at",i).order("created_at",{ascending:!1});return{data:n,error:c}}catch(s){return console.error("Error fetching invites for user:",s),{data:null,error:s}}},D=async t=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{error:e}=await r.from("collaboration_invites").update({status:"declined"}).eq("id",t);if(e)throw e;return{success:!0}}catch(e){return console.error("Error declining collaboration invite:",e),{success:!1,error:e.message}}},I=async t=>{if(!r)return{data:null,error:"Supabase not configured"};try{const{data:e,error:o}=await r.from("collaborative_collections").select(`
        id,
        title,
        description,
        owner_id,
        collaborators,
        permissions,
        shared_memories,
        is_public,
        created_at,
        updated_at,
        profiles!collaborative_collections_owner_id_fkey (
          full_name,
          avatar_url
        )
      `).contains("collaborators",[t]).order("updated_at",{ascending:!1});return{data:e,error:o}}catch(e){return console.error("Error fetching collaborative collections:",e),{data:null,error:e}}},U=async(t,e)=>{if(!r)return{success:!1,error:"Supabase not configured"};try{const{data:o}=await r.auth.getUser();if(!o.user)throw new Error("User not authenticated");const{data:s}=await r.from("collaborative_collections").select("permissions, shared_memories").eq("id",t).single(),i=s==null?void 0:s.permissions[o.user.id];if(!i||i==="view")throw new Error("Insufficient permissions to add memories");const a=[...(s==null?void 0:s.shared_memories)||[],e],{error:n}=await r.from("collaborative_collections").update({shared_memories:a,updated_at:new Date().toISOString()}).eq("id",t);if(n)throw n;return{success:!0}}catch(o){return console.error("Error adding memory to collection:",o),{success:!1,error:o.message}}},O={shareMemoryWithUser:g,getSharedMemoriesWithMe:v,getMemoriesSharedByMe:h,createCollaborativeCollection:b,inviteUserToCollection:y,acceptCollaborationInvite:S,declineCollaborationInvite:D,getUserCollaborativeCollections:I,addMemoryToCollection:U,getMemoriesByIds:w,getInvitesSentByUser:E,getInvitesForUser:q};export{O as c};
//# sourceMappingURL=collaborativeMemoryService-C774JkFX.js.map
