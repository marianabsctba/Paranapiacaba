# Gera os personagens do Panela de Pressão 4D com MakeHuman (MPFB, assets CC0) no Blender.
# Uso: blender -b --factory-startup -P gerar.py -- <saida> <animacoes_fonte.glb> [ids...]
import bpy, bmesh, sys, os, glob, math
from mathutils import Vector, Matrix, Quaternion
import addon_utils

addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.locationservice import LocationService

args = sys.argv[sys.argv.index("--") + 1:]
SAIDA, ANIM_FONTE = args[0], args[1]
SO = set(args[2:])
os.makedirs(SAIDA, exist_ok=True)
DADOS = LocationService.get_user_data()


def achar(tipo, nome, ext="mhclo"):
    r = glob.glob(os.path.join(DADOS, tipo, nome, "*." + ext)) or glob.glob(os.path.join(DADOS, tipo, nome + "*", "*." + ext))
    if not r:
        raise RuntimeError(f"não achei {tipo}/{nome}")
    return r[0]


def idade(anos):
    return 0.1875 + (anos - 11) / 14 * 0.3125 if anos <= 25 else 0.5 + (anos - 25) / 65 * 0.5


# id, sexo, idade, etnia, peso, músculo, altura, cabelo, roupa(s), avental
SPECS = [
    dict(id="kleber", f=0, anos=38, raca="caucasian", peso=0.78, musc=0.55, alt=0.62, cabelo="short02", roupas=["namuhekam_male_polo_shirt", "toigo_wool_pants", "shoes02"], avental=1),
    dict(id="jessica", f=1, anos=24, raca="caucasian", peso=0.45, musc=0.45, alt=0.42, cabelo="long01", roupas=["joepal_crude_t-shirt_female", "cortu_cargo_pants", "toigo_flats"], avental=1),
    dict(id="arlindo", f=0, anos=67, raca="african", peso=0.62, musc=0.4, alt=0.45, cabelo="short01", roupas=["namuhekam_male_polo_shirt", "toigo_wool_pants", "shoes01"], avental=1),
    dict(id="bruna", f=1, anos=29, raca="caucasian", peso=0.38, musc=0.5, alt=0.5, cabelo="ponytail01", roupas=["toigo_basic_tucked_t-shirt", "toigo_wool_pants", "toigo_flats"], avental=1),
    dict(id="thigas", f=0, anos=31, raca="caucasian", peso=0.5, musc=0.5, alt=0.58, cabelo="short03", roupas=["elvs_crude_t-shirt_male", "cortu_cargo_pants", "shoes03"], avental=1),
    dict(id="neide", f=1, anos=59, raca="african", peso=0.78, musc=0.4, alt=0.3, cabelo="braid01", roupas=["toigo_fisherman_sweater", "toigo_long_full_skirt", "toigo_ballet_flats"], avental=1),
    dict(id="ravi", f=0, anos=27, raca="asian", peso=0.42, musc=0.45, alt=0.5, cabelo="afro01", roupas=["elvs_crude_t-shirt_male", "cortu_cargo_pants", "shoes04"], avental=1),
    dict(id="patricia", f=1, anos=45, raca="caucasian", peso=0.5, musc=0.45, alt=0.55, cabelo="bob01", roupas=["toigo_female_suit", "toigo_flats"], avental=1),
    dict(id="wesley", f=0, anos=22, raca="african", peso=0.45, musc=0.55, alt=0.55, cabelo="short04", roupas=["elvs_crude_t-shirt_male", "cortu_jeans_shorts", "shoes05"], avental=1),
    dict(id="marcelle", f=1, anos=36, raca="caucasian", peso=0.42, musc=0.45, alt=0.62, cabelo="long01", roupas=["toigo_camisole_top", "toigo_tiered_skirt", "toigo_ankle_boots_female"], avental=1),
    dict(id="gilmar", f=0, anos=50, raca="caucasian", peso=0.88, musc=0.5, alt=0.55, cabelo=None, roupas=["namuhekam_male_polo_shirt", "toigo_wool_pants", "toigo_ankle_boots_male"], avental=1),
    dict(id="yasmin", f=1, anos=26, raca="african", peso=0.45, musc=0.5, alt=0.45, cabelo="afro01", roupas=["toigo_basic_tucked_t-shirt", "toigo_harem_pants", "toigo_flats"], avental=1),
    dict(id="otavio", f=0, anos=41, raca="caucasian", peso=0.55, musc=0.45, alt=0.7, cabelo="short01", roupas=["male_casualsuit03", "shoes02"], avental=1),
    dict(id="raquel", f=1, anos=33, raca="caucasian", peso=0.45, musc=0.5, alt=0.4, cabelo="ponytail01", roupas=["toigo_basic_tucked_t-shirt", "toigo_wool_pants", "toigo_flats"], avental=1),
    dict(id="juninho", f=0, anos=19, raca="caucasian", peso=0.38, musc=0.45, alt=0.5, cabelo="short03", roupas=["elvs_crude_t-shirt_male", "cortu_jeans_shorts", "shoes06"], avental=1),
    dict(id="jacuzzi", f=0, anos=58, raca="caucasian", peso=0.85, musc=0.45, alt=0.68, cabelo="short01", roupas=["toigo_male_double-breasted_suit", "shoes02"], avental=0),
    dict(id="risotto", f=1, anos=47, raca="caucasian", peso=0.4, musc=0.45, alt=0.5, cabelo="ponytail01", roupas=["toigo_female_double-breasted_suit", "toigo_flats"], avental=0),
    dict(id="fumaca", f=0, anos=50, raca="caucasian", peso=0.62, musc=0.72, alt=0.62, cabelo=None, roupas=["elvs_crude_t-shirt_male", "cortu_cargo_pants", "toigo_ankle_boots_male"], avental=0),
    dict(id="patrao", f=1, anos=50, raca="caucasian", peso=0.45, musc=0.45, alt=0.58, cabelo="bob02", roupas=["toigo_female_suit_2", "toigo_flats"], avental=0),
]

ROLE = {"shirt": "camisa", "polo": "camisa", "t-shirt": "camisa", "top": "camisa", "sweater": "camisa", "pants": "calca", "shorts": "calca", "skirt": "calca", "shoes": "sapato", "flats": "sapato", "boots": "sapato", "suit": "terno"}


def papel(nome):
    for k, v in ROLE.items():
        if k in nome:
            return v
    return "roupa"


def limpar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)


def criar(s):
    raca = {"asian": 0.05, "caucasian": 0.05, "african": 0.05}
    raca[s["raca"]] = 0.9
    macro = {"gender": 0.0 if s["f"] else 1.0, "age": idade(s["anos"]), "muscle": s["musc"], "weight": s["peso"], "proportions": 0.55,
             "height": s["alt"], "cupsize": 0.5, "firmness": 0.5, "race": raca}
    base = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
    faixa = "young" if s["anos"] < 35 else "middleage" if s["anos"] < 56 else "old"
    HumanService.set_character_skin(achar("skins", f"{faixa}_{s['raca']}_{'female' if s['f'] else 'male'}", "mhmat"), base, skin_type="GAMEENGINE")
    rig = HumanService.add_builtin_rig(base, "game_engine", import_weights=True)
    rig = rig or next(o for o in bpy.data.objects if o.type == "ARMATURE")
    HumanService.add_mhclo_asset(achar("eyes", "low-poly"), base, asset_type="Eyes", subdiv_levels=0)
    HumanService.add_mhclo_asset(achar("eyebrows", "eyebrow001" if s["f"] else "eyebrow006"), base, asset_type="Eyebrows", subdiv_levels=0)
    HumanService.add_mhclo_asset(achar("eyelashes", "eyelashes01"), base, asset_type="Eyelashes", subdiv_levels=0)
    if s["cabelo"]:
        h = HumanService.add_mhclo_asset(achar("hair", s["cabelo"]), base, asset_type="Hair", subdiv_levels=0)
        if h:
            h.name = "cabelo"
    for r in s["roupas"]:
        c = HumanService.add_mhclo_asset(achar("clothes", r), base, asset_type="Clothes", subdiv_levels=0)
        if c:
            c.name = "roupa_" + papel(r)
    base.name = "corpo"
    erodir_mascara(base, aneis=3)
    if s["avental"]:
        avental(base, rig)
    return base, rig


def suave(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def mat_simples(nome, cor, metal=0.0, rug=0.8):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*cor, 1); p.inputs["Metallic"].default_value = metal; p.inputs["Roughness"].default_value = rug
    return m


def tira(nome, pontos, raio):
    """Cordão (curva com espessura) convertido em malha."""
    cu = bpy.data.curves.new(nome, "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = raio; cu.bevel_resolution = 1; cu.resolution_u = 10
    sp = cu.splines.new("NURBS"); sp.points.add(len(pontos) - 1)
    for p, c in zip(sp.points, pontos):
        p.co = (c.x, c.y, c.z, 1)
    sp.use_endpoint_u = True; sp.order_u = 3
    ob = bpy.data.objects.new(nome, cu); bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.convert(target="MESH")
    return bpy.context.view_layer.objects.active


def erodir_mascara(base, aneis=3):
    """Mantém uma faixa de pele sob as bordas da roupa: sem buraco quando o corpo se mexe."""
    for g in base.vertex_groups:
        if not any(m.type == "MASK" and m.vertex_group == g.name for m in base.modifiers):
            continue
        idx = g.index
        apagar = {v.index for v in base.data.vertices if any(x.group == idx and x.weight > 0.5 for x in v.groups)}
        viz = {}
        for e in base.data.edges:
            a, b = e.vertices
            viz.setdefault(a, []).append(b); viz.setdefault(b, []).append(a)
        for _ in range(aneis):
            borda = {v for v in apagar if any(n not in apagar for n in viz.get(v, []))}
            apagar -= borda
        g.remove([v.index for v in base.data.vertices])
        g.add(list(apagar), 1.0, "REPLACE")
        print("mascara", g.name, len(apagar))


def avental(base, rig):
    # Superfície única com corpo e roupas já deformados: o avental fica por fora de tudo
    dg = bpy.context.evaluated_depsgraph_get()
    junto = bmesh.new()
    for o in [o for o in bpy.data.objects if o.type == "MESH" and (o.name.startswith("roupa_") or o.name == "corpo")]:
        me_ev = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me_ev.transform(o.matrix_world)
        junto.from_mesh(me_ev)
        bpy.data.meshes.remove(me_ev)
    me_alvo = bpy.data.meshes.new("alvo_tmp"); junto.to_mesh(me_alvo); junto.free()
    alvo = bpy.data.objects.new("alvo_tmp", me_alvo); bpy.context.scene.collection.objects.link(alvo)
    pts = [v.co.copy() for v in me_alvo.vertices]
    zmin = min(p.z for p in pts); zmax = max(p.z for p in pts); H = zmax - zmin
    zj, zc, zt = zmin + 0.30 * H, zmin + 0.575 * H, zmin + 0.775 * H
    frente_baixo = min(p.y for p in pts if zj < p.z < zc and abs(p.x) < 0.1 * H)
    frente_peito = min(p.y for p in pts if zc < p.z < zt and abs(p.x) < 0.08 * H)
    saia0, saia1, peito = 0.097 * H, 0.108 * H, 0.066 * H

    def meia(z):
        if z <= zc:
            return saia0 + (saia1 - saia0) * (zc - z) / (zc - zj)
        return peito + (saia0 - peito) * (1 - suave((z - zc) / (0.075 * H)))

    curva = 0.035 / (saia0 ** 2)
    nx, nz = 24, 64
    bm = bmesh.new()
    linhas = []
    for k in range(nz + 1):
        z = zj + (zt - zj) * k / nz
        w = meia(z) * (0.97 if k == 0 else 1)
        linha = []
        for i in range(nx + 1):
            x = -w + 2 * w * i / nx
            y = frente_baixo - 0.018 + curva * x * x if z <= zc else frente_peito - 0.06
            linha.append(bm.verts.new((x, y, z)))
        linhas.append(linha)
    for k in range(nz):
        for i in range(nx):
            f = bm.faces.new((linhas[k][i], linhas[k][i + 1], linhas[k + 1][i + 1], linhas[k + 1][i]))
            borda = i == 0 or i == nx - 1 or k == 0 or k == nz - 1
            c = f.calc_center_median()
            emblema = (c.x ** 2 + (c.z - (zt - 0.055 * H)) ** 2) ** 0.5 < 0.016 * H
            f.material_index = 1 if (borda or emblema) else 0
            f.smooth = True
    me = bpy.data.meshes.new("avental"); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("avental", me); bpy.context.scene.collection.objects.link(ob)
    me.materials.append(mat_simples("avental_azul", (0.012, 0.035, 0.19), 0.0, 0.85))
    me.materials.append(mat_simples("avental_ouro", (0.78, 0.48, 0.07), 0.85, 0.32))
    # Só o peito e a cintura colam no corpo; a saia cai reta a partir do quadril
    vg = ob.vertex_groups.new(name="envolver")
    for v in me.vertices:
        vg.add([v.index], suave((v.co.z - (zc - 0.10 * H)) / (0.08 * H)), "REPLACE")
    sw = ob.modifiers.new("sw", "SHRINKWRAP")
    sw.target = alvo; sw.wrap_method = "PROJECT"; sw.use_project_y = True; sw.use_negative_direction = False; sw.use_positive_direction = True
    sw.offset = 0.012; sw.project_limit = 0.3; sw.wrap_mode = "OUTSIDE_SURFACE"; sw.vertex_group = "envolver"
    sm = ob.modifiers.new("suave", "CORRECTIVE_SMOOTH"); sm.iterations = 6; sm.use_only_smooth = True
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    ob.vertex_groups.remove(ob.vertex_groups["envolver"])
    # Alça no pescoço e cordão na cintura
    pescoco = rig.matrix_world @ rig.data.bones["neck_01"].head_local
    esq = me.vertices[nz * (nx + 1)].co.copy(); dir_ = me.vertices[nz * (nx + 1) + nx].co.copy()
    lado = 0.055 * H / 1.75
    alca = tira("alca", [esq, Vector((esq.x * 0.8, pescoco.y - 0.02, pescoco.z - 0.03)), Vector((-lado, pescoco.y + 0.03, pescoco.z + 0.01)),
                         Vector((0, pescoco.y + 0.07, pescoco.z + 0.015)), Vector((lado, pescoco.y + 0.03, pescoco.z + 0.01)),
                         Vector((dir_.x * 0.8, pescoco.y - 0.02, pescoco.z - 0.03)), dir_], 0.006)
    for t in (alca,):
        s2 = t.modifiers.new("sw", "SHRINKWRAP"); s2.target = alvo; s2.wrap_method = "NEAREST_SURFACEPOINT"; s2.offset = 0.007
        bpy.context.view_layer.objects.active = t
        bpy.ops.object.modifier_apply(modifier="sw")
        t.data.materials.clear(); t.data.materials.append(me.materials[0])
        for f in t.data.polygons:
            f.use_smooth = True
    bpy.ops.object.select_all(action="DESELECT")
    for o in (ob, alca):
        o.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.join()
    me = ob.data
    # Pesos dos ossos copiados do corpo, restritos ao tronco e ao pescoço
    dt = ob.modifiers.new("pesos", "DATA_TRANSFER")
    dt.object = base; dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
    dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
    bpy.ops.object.datalayout_transfer(modifier="pesos")
    bpy.ops.object.modifier_apply(modifier="pesos")
    bpy.data.objects.remove(alvo)
    manter = {"pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r"}
    for g in list(ob.vertex_groups):
        if g.name not in manter:
            ob.vertex_groups.remove(g)
    for nome in manter:
        if nome not in ob.vertex_groups:
            ob.vertex_groups.new(name=nome)
    gp = ob.vertex_groups["pelvis"]
    for v in me.vertices:
        if sum(g.weight for g in v.groups) < 0.05:
            gp.add([v.index], 1.0, "REPLACE")
    ob.parent = rig
    am = ob.modifiers.new("Armature", "ARMATURE"); am.object = rig


def encolher_texturas():
    for img in bpy.data.images:
        n = img.name.lower()
        lado = 1024 if ("skin" in n or "body" in n or "litsphere" in n) else 256 if ("eye" in n or "brow" in n or "lash" in n) else 512
        if img.size[0] > lado or img.size[1] > lado:
            try:
                img.scale(min(lado, img.size[0]), min(lado, img.size[1]))
            except Exception as e:
                print("textura", img.name, e)


def exportar(caminho, objetos, animar=False):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objetos:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objetos[0]
    bpy.ops.export_scene.gltf(filepath=caminho, export_format="GLB", use_selection=True, export_apply=True,
                              export_animations=animar, export_animation_mode="ACTIONS", export_force_sampling=True,
                              export_image_format="WEBP", export_image_quality=78, export_yup=True,
                              export_draco_mesh_compression_enable=not animar, export_draco_mesh_compression_level=6,
                              export_morph=False, export_skins=True, export_def_bones=True)


# ---------- Retarget das animações (Quaternius UAL -> esqueleto game_engine do MPFB) ----------
NOME = {"root": "Root", "Head": "head"}
CADEIA = {"clavicle_l": "upperarm_l", "clavicle_r": "upperarm_r", "upperarm_l": "lowerarm_l", "upperarm_r": "lowerarm_r",
          "lowerarm_l": "hand_l", "lowerarm_r": "hand_r", "hand_l": "middle_01_l", "hand_r": "middle_01_r",
          "thigh_l": "calf_l", "thigh_r": "calf_r", "calf_l": "foot_l", "calf_r": "foot_r",
          "pelvis": "spine_01", "spine_01": "spine_02", "spine_02": "spine_03", "spine_03": "neck_01", "neck_01": "head"}


import re
DEDO = re.compile(r"^(index|middle|ring|pinky|thumb)_0([1-3])_[lr]$")


def ehDedo(nome):
    return bool(DEDO.match(nome))


def curva_dedo(nome):
    """Mão relaxada: dedos levemente curvados, polegar quase reto."""
    m = DEDO.match(nome)
    if not m:
        return Matrix.Identity(4)
    seg = int(m.group(2))
    ang = ({1: 0.08, 2: 0.12, 3: 0.1} if m.group(1) == "thumb" else {1: 0.22, 2: 0.32, 3: 0.22})[seg]
    return Matrix.Rotation(ang * CURVA_SINAL, 4, "X")


CURVA_SINAL = 1.0


def alinhar2(d_t, n_t, d_s, n_s):
    """Rotação que leva a base (direção, normal) do alvo para a base da fonte."""
    def base(d, n):
        n2 = (n - d * n.dot(d)).normalized()
        return Matrix((d, n2, d.cross(n2))).transposed()
    return (base(d_s, n_s) @ base(d_t, n_t).transposed()).to_quaternion()


def q_mundo(m):
    return m.to_3x3().normalized().to_quaternion()


def retarget(tgt, manter_fonte=False):
    bpy.ops.import_scene.gltf(filepath=ANIM_FONTE)
    src = next(o for o in bpy.context.selected_objects if o.type == "ARMATURE")
    for o in list(bpy.context.selected_objects):
        if o.type == "MESH":
            bpy.data.objects.remove(o)
    CLIPES = {"Sitting_Idle_Loop", "Sitting_Talking_Loop", "Idle_Loop", "Idle_Talking_Loop", "Walk_Loop", "Jog_Fwd_Loop", "Sprint_Loop", "Interact", "PickUp_Table", "Dance_Loop",
              "Idle_Torch_Loop", "Spell_Simple_Idle_Loop", "Hit_Head", "Push_Loop", "Fixing_Kneeling", "Walk_Formal_Loop"}
    fontes = [a for a in bpy.data.actions if any(f.data_path.startswith("pose.bones") for f in a.fcurves)]
    def nome_limpo(n):
        n = n.split("|")[-1]
        return n[:-len("_Armature")] if n.endswith("_Armature") else n
    acoes = [a for a in fontes if nome_limpo(a.name) in CLIPES]
    print("clipes encontrados", len(acoes), "de", len(fontes), [a.name for a in fontes][:6])
    sw, tw = src.matrix_world, tgt.matrix_world
    tinv = tw.inverted()
    mapa = {}
    for sb in src.data.bones:
        nome = NOME.get(sb.name, sb.name)
        if nome in tgt.data.bones and not ehDedo(nome):
            mapa[nome] = sb.name
    # Rotação de referência: alinha a direção dos membros do alvo à da fonte (A-pose x T-pose)
    ref = {}
    for tb in tgt.data.bones:
        q_rest = q_mundo(tw @ tb.matrix_local)
        ref[tb.name] = q_rest
        if tb.name in CADEIA and tb.name in mapa and CADEIA[tb.name] in tgt.data.bones and CADEIA[tb.name] in mapa:
            filho = CADEIA[tb.name]
            dt_ = (tw @ tgt.data.bones[filho].head_local) - (tw @ tb.head_local)
            ds_ = (sw @ src.data.bones[mapa[filho]].head_local) - (sw @ src.data.bones[mapa[tb.name]].head_local)
            ref[tb.name] = dt_.rotation_difference(ds_) @ q_rest
            # Braço: alinha também a palma (direção + normal da palma), não só a direção do osso
            lado = tb.name[-1]
            if tb.name.split("_")[0] in ("upperarm", "lowerarm", "hand") and all(n in tgt.data.bones and n in mapa for n in (f"hand_{lado}", f"index_01_{lado}", f"pinky_01_{lado}")):
                def palma(arm, mw, nome_mao, nome_ind, nome_min):
                    h = mw @ arm.data.bones[nome_mao].head_local
                    return (mw @ arm.data.bones[nome_ind].head_local - h).cross(mw @ arm.data.bones[nome_min].head_local - h).normalized()
                nt = palma(tgt, tw, f"hand_{lado}", f"index_01_{lado}", f"pinky_01_{lado}")
                ns = palma(src, sw, mapa[f"hand_{lado}"], f"index_01_{lado}", f"pinky_01_{lado}")
                ref[tb.name] = alinhar2(dt_.normalized(), nt, ds_.normalized(), ns) @ q_rest
    s_rest = {n: q_mundo(sw @ src.data.bones[s].matrix_local) for n, s in mapa.items()}
    alt_t = (tw @ tgt.data.bones["pelvis"].head_local).z
    alt_s = (sw @ src.data.bones[mapa["pelvis"]].head_local).z
    razao = alt_t / alt_s if alt_s else 1
    for pb in tgt.pose.bones:
        pb.rotation_mode = "QUATERNION"
    ordem = [b for b in tgt.data.bones]  # Blender já lista pais antes dos filhos
    cena = bpy.context.scene
    tgt.animation_data_create()
    for a in acoes:
        src.animation_data.action = a
        nova = bpy.data.actions.new(nome_limpo(a.name))
        nova.use_fake_user = True
        tgt.animation_data.action = nova
        f0, f1 = int(a.frame_range[0]), int(a.frame_range[1])
        for fr in range(f0, f1 + 1):
            cena.frame_set(fr)
            M = {}
            for tb in ordem:
                R = tb.matrix_local
                Rp = tb.parent.matrix_local if tb.parent else Matrix.Identity(4)
                Mp = M[tb.parent.name] if tb.parent else Matrix.Identity(4)
                local_rest = Rp.inverted() @ R
                cabeca = (Mp @ local_rest).to_translation()
                parado = nova.name in PARADAS and tb.name in NEUTROS
                if tb.name in mapa and not parado:
                    sp = src.pose.bones[mapa[tb.name]]
                    q_s = q_mundo(sw @ sp.matrix)
                    q_t = q_s @ s_rest[tb.name].inverted() @ ref[tb.name]
                    q_arm = q_mundo(tinv) @ q_t
                    if tb.name == "pelvis":
                        ps = (sw @ sp.matrix).to_translation() - (sw @ src.data.bones[mapa["pelvis"]].head_local)
                        cabeca = (tinv @ ((tw @ R.to_translation()) + ps * razao))
                    Mb = Matrix.Translation(cabeca) @ q_arm.to_matrix().to_4x4()
                else:
                    Mb = Mp @ local_rest @ curva_dedo(tb.name)
                M[tb.name] = Mb
                basis = (Mp @ local_rest).inverted() @ Mb
                pb = tgt.pose.bones[tb.name]
                pb.rotation_quaternion = basis.to_quaternion()
                pb.keyframe_insert("rotation_quaternion", frame=fr)
                if tb.name == "pelvis":
                    pb.location = basis.to_translation()
                    pb.keyframe_insert("location", frame=fr)
        print("retarget", nova.name, f1 - f0 + 1, "quadros")
    if manter_fonte:
        return src, mapa
    bpy.data.objects.remove(src)
    for a in fontes:
        bpy.data.actions.remove(a)


PARADAS = {"Idle_Loop", "Idle_Talking_Loop", "Idle_Torch_Loop", "Interact", "PickUp_Table", "Spell_Simple_Idle_Loop", "Hit_Head", "Push_Loop"}
NEUTROS = {"pelvis", "spine_01", "spine_02", "spine_03", "thigh_l", "thigh_r", "calf_l", "calf_r", "foot_l", "foot_r", "ball_l", "ball_r"}


def endireitar(rig):
    """Animações paradas: quadril, coluna e pernas na postura neutra; braços e cabeça seguem animados."""
    for a in bpy.data.actions:
        if a.name not in PARADAS or a.name in ("Fixing_Kneeling",):
            continue
        f0, f1 = a.frame_range
        for fc in list(a.fcurves):
            osso = fc.data_path.split('"')[1] if '"' in fc.data_path else ""
            if osso in NEUTROS:
                a.fcurves.remove(fc)
        for osso in NEUTROS:
            if osso not in rig.pose.bones:
                continue
            caminho = f'pose.bones["{osso}"].rotation_quaternion'
            for i, v in enumerate((1.0, 0.0, 0.0, 0.0)):
                fc = a.fcurves.new(caminho, index=i, action_group=osso)
                fc.keyframe_points.insert(f0, v); fc.keyframe_points.insert(f1, v)
            if osso == "pelvis":
                for i in range(3):
                    fc = a.fcurves.new(f'pose.bones["pelvis"].location', index=i, action_group=osso)
                    fc.keyframe_points.insert(f0, 0.0); fc.keyframe_points.insert(f1, 0.0)
        print("endireitada", a.name)


# ---------- Principal ----------
for s in SPECS:
    if SO and s["id"] not in SO:
        continue
    limpar()
    base, rig = criar(s)
    encolher_texturas()
    objs = [rig] + [o for o in bpy.data.objects if o.type == "MESH"]
    exportar(os.path.join(SAIDA, s["id"] + ".glb"), objs)
    print("ok", s["id"])

if not SO or "animacoes" in SO:
    limpar()
    base, rig = criar(dict(id="ref", f=0, anos=30, raca="caucasian", peso=0.5, musc=0.5, alt=0.5, cabelo=None, roupas=[], avental=0))
    for o in [o for o in bpy.data.objects if o.type == "MESH"]:
        bpy.data.objects.remove(o)
    bpy.context.scene.render.fps = 30
    retarget(rig)
    endireitar(rig)
    exportar(os.path.join(SAIDA, "animacoes.glb"), [rig], animar=True)
    print("ok animacoes")


if "diag" in SO:
    limpar()
    base, rig = criar(dict(id="ref", f=0, anos=30, raca="caucasian", peso=0.5, musc=0.5, alt=0.5, cabelo=None, roupas=[], avental=0))
    for o in [o for o in bpy.data.objects if o.type == "MESH"]:
        bpy.data.objects.remove(o)
    bpy.context.scene.render.fps = 30
    src, mapa = retarget(rig, manter_fonte=True)
    endireitar(rig)
    def pos(arm, nome):
        return arm.matrix_world @ arm.pose.bones[nome].head
    for clipe in ["Idle_Loop", "Idle_Talking_Loop", "Idle_Torch_Loop", "Spell_Simple_Idle_Loop", "Interact", "PickUp_Table"]:
        acs = [a for a in bpy.data.actions if a.name == clipe]
        acf = [a for a in bpy.data.actions if a.name.startswith(clipe) and a.name != clipe]
        rig.animation_data.action = acs[0]; src.animation_data.action = acf[0]
        bpy.context.scene.frame_set(5)
        hs = (pos(src, mapa["head"]) - pos(src, mapa["pelvis"])).length
        ht = (pos(rig, "head") - pos(rig, "pelvis")).length
        print("DIAG", clipe, "altura tronco src", round(hs, 3), "tgt", round(ht, 3))
        fl = pos(rig, "foot_l") - pos(rig, "pelvis"); fr = pos(rig, "foot_r") - pos(rig, "pelvis"); ul = pos(rig, "upperarm_l"); ur = pos(rig, "upperarm_r")
        print("POSE", clipe.ljust(24), "pés (frente/trás) %.2f" % ((fl.y - fr.y) / ht), "abertura %.2f" % ((fl.x - fr.x) / ht), "giro ombros %.0f°" % math.degrees(math.atan2(ul.y - ur.y, ul.x - ur.x)))
        for b in []:
            vs = (pos(src, mapa[b]) - pos(src, mapa["pelvis"])) / hs
            vt = (pos(rig, b) - pos(rig, "pelvis")) / ht
            print("DIAG", clipe, b.ljust(11), "src", tuple(round(x, 2) for x in vs), "tgt", tuple(round(x, 2) for x in vt), "dif", round((vs - vt).length, 2))
    # rest
    for b in ["pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "head", "thigh_l", "calf_l", "upperarm_l", "lowerarm_l"]:
        bs = src.data.bones[mapa[b]]; bt = rig.data.bones[b]
        ds = (src.matrix_world.to_3x3() @ (bs.tail_local - bs.head_local)).normalized(); dt_ = (rig.matrix_world.to_3x3() @ (bt.tail_local - bt.head_local)).normalized()
        print("REST", b.ljust(11), "src dir", tuple(round(x, 2) for x in ds), "tgt dir", tuple(round(x, 2) for x in dt_))
