import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const tests = `import asyncio

import pytest
from fastapi.testclient import TestClient

from probe_api import make_app


async def ok():
    return True


def test_lifespan_gates_readiness():
    app = make_app(ok)
    client = TestClient(app)
    assert app.state.booted is False
    assert client.get("/readyz").status_code == 503
    with client:
        assert client.get("/healthz").json() == {"status": "ok"}
        assert client.get("/readyz").json() == {"ready": True}
        assert app.state.booted is True
    assert app.state.booted is False


def test_boot_gate_does_not_call_dependency():
    calls = []

    async def dependency():
        calls.append("called")
        return True

    client = TestClient(make_app(dependency))
    response = client.get("/readyz")
    assert response.status_code == 503
    assert response.json() == {"ready": False}
    assert calls == []


def test_false_status_is_not_ready_but_is_alive():
    async def unavailable():
        return False

    with TestClient(make_app(unavailable)) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        assert response.json() == {"ready": False}
        assert client.get("/healthz").status_code == 200


def test_liveness_does_not_call_dependency():
    calls = []

    async def dependency():
        calls.append("called")
        raise AssertionError("unexpected dependency access")

    with TestClient(make_app(dependency)) as client:
        assert client.get("/healthz").json() == {"status": "ok"}
    assert calls == []


def test_readiness_times_out_and_cancels_check():
    outcomes = []

    async def slow():
        try:
            await asyncio.Event().wait()
        finally:
            outcomes.append("cancelled")

    with TestClient(make_app(slow, timeout_seconds=0.03)) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        assert response.json() == {"ready": False}
        assert client.get("/healthz").status_code == 200
    assert outcomes == ["cancelled"]


def test_network_error_keeps_connection_details_private():
    async def disconnected():
        raise OSError("private-internal-host")

    with TestClient(make_app(disconnected)) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        assert response.json() == {"ready": False}
        assert "private-internal-host" not in response.text


def test_recovers_without_restarting_app():
    states = iter([False, True])

    async def recovering():
        return next(states)

    with TestClient(make_app(recovering)) as client:
        assert client.get("/readyz").status_code == 503
        assert client.get("/readyz").status_code == 200


def test_unexpected_bug_surfaces_in_test():
    async def bug():
        raise RuntimeError("unexpected adapter failure")

    with TestClient(make_app(bug)) as client:
        with pytest.raises(RuntimeError, match="unexpected adapter failure"):
            client.get("/readyz")`;

export const d143: Lesson = defineLesson({
  day: 143,
  titleTh: "ขึ้น Cloud Run หรือ Fly.io พร้อม Secrets และ Health Checks",
  tagline: "ย้าย image เดิมขึ้น staging แยก startup, liveness และ readiness แล้วคุมการส่งทราฟฟิกเข้า revision ใหม่",
  icon: "rocket",
  visual: {
    id: "cloud-deploy-health",
    title: "จาก container image สู่ revision ที่รับทราฟฟิกได้",
    caption: "ตามเส้นจาก registry ไปยัง revision ดูจุดฉีด secrets และเส้น probe ที่กำกับการรับคำขอ",
    alt: "Registry ส่ง image ไปยัง revision ที่รับ secret จากแพลตฟอร์ม มี healthz ตรวจการตอบสนองของโปรเซสและ readyz ตรวจความพร้อมก่อนรับงาน",
  },
  requiresApiKey: false,
  apiKeyNote: "โจทย์ Python ไม่ใช้ API key ส่วนการ deploy จริงใช้บัญชี สิทธิ์ และทรัพยากร staging ของคุณ",
  tools: ["Docker", "FastAPI", "Cloud Run", "Fly.io", "Secret Manager", "pytest"],
  bigPicture: [
    {
      node: 0,
      heading: "แยก staging ออกจากงานผู้ใช้จริง",
      body: "ทีมต้องให้ผู้ทดสอบลองระบบถามระเบียบเบิกค่าเดินทางผ่าน URL เดียวก่อนเปิดให้คนในองค์กร",
      lessonNote: "เริ่มจาก service staging และใช้ข้อมูลสังเคราะห์ตามขอบเขตการทดลอง",
    },
    {
      node: 4,
      heading: "ส่ง image เดิมและฉีดค่าตอนเริ่มงาน",
      body: "ใช้ image จาก Day 141 โดยระบุ digest และตั้งค่า connection กับ telemetry ตอนเปิด runtime",
      lessonNote: "Cloud Run รับค่า PORT จากแพลตฟอร์ม ส่วน Fly.io ตั้ง internal_port ให้ตรงกับ Uvicorn",
    },
    {
      node: 5,
      heading: "อ่านสัญญาณของแต่ละ probe",
      body: "แยกโปรเซสตอบได้ออกจาก dependency พร้อม และเก็บผลวัดหลัง idle เทียบกับคำขอถัดไป",
      lessonNote: "ใช้ /healthz สำหรับ liveness และ /readyz สำหรับ readiness ตามความสามารถของแพลตฟอร์ม",
    },
    {
      node: 6,
      heading: "ทดสอบก่อนเปลี่ยน traffic",
      body: "รุ่นใหม่เริ่มจาก tagged revision ที่ยังไม่มีสัดส่วน traffic หลัก เก็บเลข revision คู่กับผล smoke",
      lessonNote: "ถ้าพบปัญหาหลังเปิดใช้ ให้ชี้ traffic กลับรุ่นที่ตรวจแล้วและบันทึกอาการ",
    },
  ],
  objectives: [
    "อธิบาย startup, liveness และ readiness และเขียน FastAPI probe ที่จำกัดเวลาตรวจ dependency",
    "ใช้ Secret Manager หรือ Fly secrets ส่งค่าที่ runtime พร้อมเลือก service identity ที่มีสิทธิ์เท่าที่ใช้",
    "เตรียม staged rollout และอธิบายผลของ min instances ต่อค่าใช้จ่ายกับ cold start จากการวัด",
  ],
  prerequisites: [
    "Day 137 สำหรับ {{fastapi}} lifespan, app.state และ TestClient",
    "Day 138 และ Day 140 สำหรับ streaming timeouts กับโหลดเทสต์",
    "Day 141 และ Day 142 สำหรับ image, port และความต่างระหว่าง build config กับ runtime config",
  ],
  setup: {
    intro: "เริ่มด้วย Python lab บนเครื่อง เลือก Cloud Run หรือ Fly.io เพียงแห่งเดียวถ้ามี staging account และ registry อยู่แล้ว ตัวอย่าง terminal ใช้ Git Bash หรือ WSL",
    commands: `uv --version
uv run --with fastapi --with httpx --with pytest python -c "import fastapi; print(fastapi.__version__)"
# เมื่อต้อง deployment จริง ให้เช็ก CLI ของแพลตฟอร์มที่จะใช้
gcloud --version
fly version`,
    steps: [
      ["app", "เตรียม ai_service.py จาก Day 137 และ Dockerfile จาก Day 141"],
      ["local", "ทำ probe_api.py แยกจากแอปจริงก่อน แล้วค่อยย้ายกติกา readiness เข้าสู่ route เดิม"],
      ["image", "เตรียม registry image digest ของ build ที่ผ่านการตรวจ และใช้ linux/amd64 สำหรับตัวอย่าง Cloud Run"],
      ["permissions", "หาก deploy จริง ใช้ staging service account, Invoker สำหรับผู้ทดสอบ และสิทธิ์อ่าน secret เฉพาะรายการที่ต้องใช้"],
    ],
    note: "Cloud Run/Fly.io อาจคิดค่าบริการตามการใช้งาน โจทย์ pytest ทำได้ครบโดยไม่สร้าง cloud resource",
  },
  concepts: [
    {
      id: "d143-probes",
      title: "1 · ให้แต่ละ probe ตัดสินใจคนละเรื่อง",
      paragraphs: [
        "Startup probe ใช้บอกว่า instance ผ่านช่วงเริ่มระบบหรือยัง ให้เวลาพอสำหรับโหลด client และข้อมูลที่จำเป็น เมื่อผ่าน startup แล้วจึงเริ่มวงจรตรวจต่อเนื่อง ตั้งให้ startup ยืนยันความพร้อมขั้นต่ำก่อนรับคำขอแรก",
        "Liveness /healthz ตอบจากโปรเซสอย่างรวดเร็ว ถ้าฐานข้อมูลหรือ Langfuse ช้าชั่วคราว โปรเซสที่ยังรันควรตอบ 200 เพื่อหลีกเลี่ยง restart พร้อมกันหลาย instance",
        "Readiness /readyz คืน 503 เมื่อ dependency ที่จำเป็นยังใช้ไม่ได้ จำกัดเวลาแต่ละ check และให้ผลบอกสถานะโดยไม่เผย hostname, token หรือ stack trace",
      ],
      analogy: "ถามสามจังหวะ ห้องเปิดไฟได้หรือยัง คนเฝ้าห้องยังตอบอยู่ไหม และอุปกรณ์ทำงานพร้อมรับงานหรือยัง",
      bullets: [
        "โหมด mock ตรวจ boot state และ mock adapter ที่ใช้จริง",
        "โหมด retrieval ตรวจ connection และ query ราคาถูกจาก pool ที่ lifespan สร้าง",
        "จำกัด probe budget ให้น้อยกว่า timeout ของ platform และกัน exporter ออกจากเส้นทาง health",
      ],
      code: {
        language: "python",
        filename: "ai_service.py",
        caption: "ตัวอย่าง adapter สำหรับฐานข้อมูลแบบ asyncpg ที่ lifespan จัดการ pool ให้",
        code: `async def retrieval_is_ready(pool) -> bool:
    async with pool.acquire() as connection:
        vector_extension = await connection.fetchval(
            "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')"
        )
        return vector_extension is True

# เรียกผ่าน asyncio.wait_for ภายใน /readyz
# ให้ adapter แปลงข้อผิดพลาด connection ที่คาดไว้เป็น False
# ตรวจ migration ของ schema จริงเพิ่มเติมเมื่อเปิด retrieval จริง`,
      },
      whyTitle: "เลือกกลไก routing จากแพลตฟอร์มที่ใช้",
      whyParagraphs: [
        "Cloud Run ให้ตั้ง readiness probe เพิ่มเพื่อพัก route ใหม่เข้า instance ที่ไม่พร้อม เมื่อ startup ผ่าน instance อาจได้รับคำขอก่อนผล readiness ครั้งแรก จึงให้ startup ตรวจความพร้อมขั้นต่ำด้วย",
        "ในตัวอย่าง Cloud Run เราตั้ง startup ให้ยิง /readyz และ liveness ให้ยิง /healthz แล้วทดสอบทั้งสอง route ด้วย smoke gate ก่อนย้าย traffic หลัก ส่วน Fly.io ใช้ HTTP service check ที่ /readyz กำกับ routing และ deploy",
      ],
    },
    {
      id: "d143-runtime",
      title: "2 · ผูก runtime config กับ identity",
      paragraphs: [
        "Image ควรอ้างอิงได้ด้วย digest แบบ sha256 จาก registry ใช้ image เดียวกันระหว่างสภาพแวดล้อมแล้วกำหนด {{env-config}} ตาม service ที่นำไปรัน",
        "Cloud Run Secret Manager ให้ service account ของ runtime อ่าน secret ที่ระบุ ให้สิทธิ์ roles/secretmanager.secretAccessor ที่ระดับ secret และ pin version เมื่อส่งแบบ environment เพื่อให้ revision เดียวกันเริ่มด้วยค่าเดียวกัน",
        "Fly secrets เก็บค่าใน vault แล้วฉีดเป็น environment เมื่อ Machine เริ่ม ใช้ secrets import จากช่องทางที่เตรียมค่าไว้อย่างปลอดภัยและเลือก --stage หากต้องการเปิดพร้อม deploy รอบถัดไป",
      ],
      analogy: "ส่งกล่องอุปกรณ์แบบปิดผนึกไปทุกสาขา แล้วให้แต่ละสาขารับกุญแจจากตู้ที่ตรวจสิทธิ์ได้ขณะเริ่มกะ",
      code: {
        language: "bash",
        filename: "terminal",
        code: `# secret นี้สร้างและใส่ version 1 ไว้ใน Secret Manager แล้ว
gcloud secrets add-iam-policy-binding staging-langfuse-sk \\
  --project "$PROJECT" \\
  --member "serviceAccount:$RUNTIME_SA" \\
  --role roles/secretmanager.secretAccessor

# เมื่อเลือก Fly.io ให้รับไฟล์ env จากที่จัดเก็บที่เข้าถึงได้เฉพาะเจ้าของ
fly secrets import --stage --app "$FLY_APP" < "$STAGING_SECRET_FILE"`,
      },
      whyTitle: "หมุน credential พร้อมบันทึกรุ่นที่ใช้งาน",
      whyParagraphs: [
        "อย่าใส่ค่าใน Dockerfile, build args, committed env หรือ log ระบุเฉพาะชื่อ secret กับ version ใน revision แล้วรักษาสิทธิ์ของคนที่ deploy เพราะเขาเปลี่ยนโค้ดที่อ่าน env ได้",
        "สร้าง secret version ใหม่และทดสอบกับ candidate ก่อนขยับ traffic หากต้องเก็บ rollback window ให้รักษาความใช้ได้ของ credential ที่รุ่นเก่าพึ่งในช่วงนั้น",
      ],
    },
    {
      id: "d143-fly",
      title: "3 · จับคู่พอร์ตและเวลา scale กับแพลตฟอร์ม",
      paragraphs: [
        "Cloud Run ส่ง PORT ให้ container และคาดว่า ingress process รับที่ 0.0.0.0 ตัวอย่าง Day 141 ใช้ PORT และ default 8080 อยู่แล้ว",
        "Fly Proxy ใช้ internal_port ของ http_service ตั้งค่า PORT ให้ตรงกับพอร์ตที่ Dockerfile เปิด แล้วกำหนด HTTP health check ด้วย grace period ที่สอดคล้องกับ startup ที่วัดได้",
        "เมื่อ idle แล้ว scale ลง คำขอแรกอาจรอโหลด image หรือ initialize pool การคง instance อุ่นอาจลดส่วนนี้ แต่ยังมี cold start เมื่อ scale ออกเกินจำนวนที่อุ่นไว้",
      ],
      analogy: "เปิดเคาน์เตอร์หนึ่งช่องค้างไว้ช่วยลูกค้าคนแรก แต่ช่วงคนมาพร้อมกันยังต้องเปิดเคาน์เตอร์เพิ่ม",
      code: {
        language: "text",
        filename: "fly.toml",
        code: `app = "expense-qa-staging-example"
primary_region = "sin"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    method = "GET"
    path = "/readyz"
    interval = "15s"
    timeout = "3s"
    grace_period = "15s"`,
      },
      whyTitle: "ปรับจากเวลาและต้นทุนของงานจริง",
      whyParagraphs: [
        "วัด latency ครั้งแรกหลัง idle เทียบกับหลายคำขอถัดไปและดู logs ตอน startup ใช้ P95 จากจำนวนคำขอที่เพียงพอก่อนตัดสินใจเพิ่ม minimum",
        "Cloud Run มี minimum ระดับ service และ revision ที่คิดพฤติกรรมต่างกัน ตัวอย่างใช้ระดับ service ส่วน Fly min_machines_running ใช้ใน primary region เมื่อเปิด autostop",
      ],
    },
    {
      id: "d143-rollout",
      title: "4 · แยก deploy ออกจากการย้าย traffic",
      paragraphs: [
        "Cloud Run สร้าง revision เมื่อ image หรือ runtime config เปลี่ยน ติด tag ให้ candidate และใช้ --no-traffic เพื่อให้ตรวจ URL ของรุ่นใหม่ได้ก่อน",
        "หลังผ่าน smoke และทีมอนุมัติ ลองแบ่งสัดส่วนเล็ก ๆ ไป revision ใหม่ ดูสัญญาณ error, tail latency และ trace เทียบ baseline เก็บ revision เดิมไว้เพื่อชี้ traffic กลับได้",
        "Fly.io ใช้ Machine deployment strategy เช่น rolling และตั้ง service checks ตาม fly.toml ตัวอย่างให้มี staging app แยกเพื่อทดสอบก่อน deploy app ที่รับงานจริง",
      ],
      analogy: "ลองใช้เคาน์เตอร์ใหม่กับผู้ทดสอบก่อน แล้วค่อยให้ลูกค้าบางส่วนย้ายเข้ามา",
      code: {
        language: "bash",
        filename: "terminal",
        code: `# ใช้กับ staging service ที่มี baseline และ candidate พร้อมแล้ว
gcloud run services update-traffic "$SERVICE" --region "$REGION" \\
  --to-revisions "$PREVIOUS=95,$CANDIDATE=5"
# ถ้า smoke ซ้ำหรือ metrics เสีย ให้ย้าย staging กลับ baseline
gcloud run services update-traffic "$SERVICE" --region "$REGION" \\
  --to-revisions "$PREVIOUS=100"`,
      },
      whyTitle: "เก็บเหตุผลให้ย้อนได้ในรอบถัดไป",
      whyParagraphs: [
        "บันทึก digest, revision, secret version, ผล probe, และช่วงเวลาที่ดู metrics เพื่อแยกเหตุจาก code change กับ config change",
        "ทราฟฟิกที่ย้อนกลับไม่ได้ย้อนฐานข้อมูล ควรทำ migration ให้เข้ากันได้กับ revision ก่อนหน้า และให้รุ่นใหม่ตรวจ schema ที่ต้องใช้",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge · Preview URL กับ revision tag",
      body: [
        "ใช้ tagged URL ตรวจ backend รุ่นใหม่แบบเดียวกับ preview ของเว็บ แล้วให้ consumer ปกติใช้ service URL เดิม",
        "เวลาทดสอบ SSE ให้วัดทั้งเวลารอ event แรกและเวลาจบ stream แล้วตรวจ timeout ของทุกช่วงที่คำขอวิ่งผ่าน",
      ],
      table: [
        ["Tagged URL", "ใช้ตรวจ candidate โดยตรง"],
        ["Service URL", "รับ traffic ตามสัดส่วนที่ตั้งไว้"],
        ["Service account", "ตัวตน runtime ที่ใช้เข้าถึง secret และบริการ"],
      ],
    },
    student: {
      title: "First-Year Note · บัตรนักศึกษากับกุญแจห้อง",
      body: [
        "นึกว่า image คือชุดงานส่งที่ทุกคนตรวจได้ ส่วน service identity เหมือนบัตรที่ใช้ขอกุญแจของห้องทดลองตามสิทธิ์",
        "ลองวาดลูกศร request จากผู้ทดสอบไปแอป และลูกศรอีกเส้นจากแอปไป Secret Manager เพื่อแยกสิทธิ์คนเรียกออกจากสิทธิ์ของโปรเซส",
      ],
    },
  },
  workedExample: {
    intro: "นำ expense-qa ขึ้น staging ในโหมด mock จาก image ที่ผ่าน Day 141 หากฝึกบนเครื่องให้ทำขั้นแรกกับ app ตัวอย่าง ส่วน Cloud Run และ Fly.io เป็นเส้นทางให้เลือกตามบัญชีที่มี",
    steps: [
      {
        title: "1 · พิสูจน์ว่า probe มีหน้าที่แยกกัน",
        explain: "ใช้ make_app ในเฉลยด้านล่างกับ dependency ที่คืน False แล้วเปิด TestClient แบบ context manager เพื่อให้ lifespan ทำงาน",
        code: {
          language: "python",
          filename: "check_probes.py",
          code: `from fastapi.testclient import TestClient
from probe_api import make_app


async def unavailable():
    return False


with TestClient(make_app(unavailable)) as client:
    for endpoint in ("/healthz", "/readyz"):
        response = client.get(endpoint)
        print(endpoint, response.status_code, response.json())`,
        },
        output: "/healthz 200 {'status': 'ok'}\n/readyz 503 {'ready': False}",
      },
      {
        title: "2 · Deploy candidate บน Cloud Run โดยยังไม่เปลี่ยน traffic",
        explain: "ตั้ง PROJECT ด้วย gcloud config หรือ --project และใช้ REGION, RUNTIME_SA, IMAGE ซึ่งเป็น registry digest ของคุณ ตัวอย่างพิสูจน์ probe บน service staging ที่มีอยู่แล้ว หากสร้าง service แรกให้ deploy staging ส่วนตัวก่อนจนมี baseline",
        code: {
          language: "bash",
          filename: "terminal",
          code: `SERVICE=expense-qa-staging
gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" \\
  --image "$IMAGE" --service-account "$RUNTIME_SA" \\
  --no-allow-unauthenticated --port 8080 --min 0 \\
  --update-secrets LANGFUSE_SECRET_KEY=staging-langfuse-sk:1 \\
  --startup-probe="httpGet.path=/readyz,httpGet.port=8080,periodSeconds=20,failureThreshold=3,timeoutSeconds=2" \\
  --liveness-probe="httpGet.path=/healthz,httpGet.port=8080,periodSeconds=10,failureThreshold=3,timeoutSeconds=2" \\
  --no-traffic --tag candidate
gcloud run services describe "$SERVICE" --project "$PROJECT" \\
  --region "$REGION" --format='yaml(status.traffic)'`,
        },
        output: "status:\n  traffic:\n  - percent: 100\n    revisionName: expense-qa-staging-00007\n  - revisionName: expense-qa-staging-00008\n    tag: candidate\n    url: https://candidate---expense-qa-staging-EXAMPLE.run.app",
      },
      {
        title: "3 · ตรวจ candidate หรือตรวจ staging บน Fly.io",
        explain: "ตั้ง CANDIDATE_URL จากผลก่อนหน้า ใช้ผู้ทดสอบที่มี Invoker บน Cloud Run ถ้าเลือก Fly.io ให้ตั้ง app name ใน fly.toml ให้ตรงกับ FLY_APP และ deploy image ที่ Fly อ่านได้ เปิด URL เฉพาะเมื่อมีขอบเขตการเข้าถึงสำหรับ staging",
        code: {
          language: "bash",
          filename: "terminal",
          code: `# เส้นทาง A: Cloud Run
token=$(gcloud auth print-identity-token)
for endpoint in healthz readyz; do
  curl --fail --silent --show-error --max-time 15 \\
    -H "Authorization: Bearer $token" "$CANDIDATE_URL/$endpoint"
  printf '\\n'
done
unset token
# เส้นทาง B: Fly.io
fly deploy --app "$FLY_APP" --image "$IMAGE" --strategy rolling
fly checks list --app "$FLY_APP"`,
        },
        output: "{\"status\":\"ok\"}\n{\"ready\":true}\nตัวอย่าง Fly: service HTTP check passing",
      },
    ],
    gotcha: "หาก config มี Langfuse key เพียงตัวเดียว smoke วันนี้ยังดูเฉพาะ health เติม LANGFUSE_PUBLIC_KEY กับ LANGFUSE_BASE_URL จาก project staging ก่อนทดสอบ export ใน Day 144 และใช้สิทธิ์เข้าถึง URL ให้ตรงกับผู้ทดสอบ",
  },
  practice: {
    intro: "โจทย์ 12 นาที สร้าง FastAPI probe app ขนาดเล็กเพื่อพิสูจน์กติกาก่อนย้ายเข้า route เดิมของระบบถามระเบียบเบิกค่าเดินทาง",
    requirements: [
      "make_app รับ async callable คืน bool และ timeout_seconds ใช้ lifespan เปลี่ยน app.state.booted",
      "/healthz คืน 200 กับ status ok โดยไม่เรียก dependency ทุกกรณี",
      "/readyz คืน 503 กับ ready false ขณะยังไม่ boot, dependency คืน False, timeout หรือเกิด OSError",
      "เมื่อ dependency ฟื้น ให้ /readyz คืน 200 ตามผลตรวจล่าสุด ห้ามเผย connection details ผ่าน response",
    ],
    starter: {
      filename: "probe_api.py",
      language: "python",
      code: `import asyncio
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

Check = Callable[[], Awaitable[bool]]


def make_app(check: Check, timeout_seconds: float = 0.25) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # TODO: ตั้ง booted ก่อน yield และเก็บกวาดใน finally
        yield

    app = FastAPI(lifespan=lifespan)
    app.state.booted = False

    @app.get("/healthz")
    async def healthz():
        # TODO: คืนสถานะของ process
        raise NotImplementedError

    @app.get("/readyz")
    async def readyz():
        # TODO: ตรวจ booted, เรียก check แบบมี budget และคืน HTTP status
        raise NotImplementedError

    return app`,
    },
    verification: { filename: "test_probe_api.py", language: "python", code: tests },
    selfCheck: [
      "ใช้ context manager ใน TestClient เพื่อทดสอบ startup กับ shutdown",
      "ลอง dependency ที่รอ Event จน timeout แล้วดูว่ามันถูก cancel",
      "ลองคืน False ครั้งแรกและ True ครั้งต่อไป แอปควรฟื้นโดยไม่ restart",
      "ลอง network error ที่มีข้อความ hostname แล้วตรวจ response ว่ามีเฉพาะ ready false",
    ],
    acceptance: "pytest ผ่านทุกกรณีและ worked example แสดง liveness 200 ขณะ readiness 503",
    hints: [
      { body: "เริ่มจาก route liveness ที่คืน dict ตรง ๆ แล้วเพิ่ม readiness gate บน booted" },
      { body: "ใช้ asyncio.wait_for ซึ่งยก TimeoutError เมื่อเกิน budget ให้จับ OSError จาก adapter อย่างเจาะจง" },
      {
        body: "แยกส่วนแรกเป็น probe_api.py และเทสต์ด้านล่างเป็น test_probe_api.py",
        code: {
          filename: "probe_api.py",
          language: "python",
          code: `import asyncio
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

Check = Callable[[], Awaitable[bool]]


def make_app(check: Check, timeout_seconds: float = 0.25) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.booted = True
        try:
            yield
        finally:
            app.state.booted = False

    app = FastAPI(lifespan=lifespan)
    app.state.booted = False

    @app.get("/healthz")
    async def healthz():
        return {"status": "ok"}

    @app.get("/readyz")
    async def readyz():
        ready = False
        if app.state.booted:
            try:
                ready = await asyncio.wait_for(check(), timeout=timeout_seconds)
            except (TimeoutError, OSError):
                ready = False

        return JSONResponse(
            status_code=200 if ready else 503,
            content={"ready": ready},
        )

    return app

# แยกเป็น test_probe_api.py
${tests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --with fastapi --with httpx --with pytest pytest -q test_probe_api.py
uv run --with fastapi --with httpx python check_probes.py`,
    },
  },
  mistakes: [
    {
      title: "ให้ liveness query ทุก dependency",
      symptom: "ฐานข้อมูลสะดุดแล้ว instance หลายตัวเริ่มใหม่พร้อมกัน",
      fix: "ให้ /healthz เช็ก process และให้ /readyz ตรวจ dependency ที่จำเป็นด้วย budget",
    },
    {
      title: "bind Uvicorn แค่ loopback ใน container",
      symptom: "curl จากข้างในผ่าน แต่ platform ติดต่อไม่ได้",
      fix: "bind 0.0.0.0 และกำหนด PORT ให้ Cloud Run หรือ internal_port ของ Fly ตรงกัน",
    },
    {
      title: "ส่ง secret ผ่าน build arg",
      symptom: "ต้อง rebuild ทุกครั้งที่หมุน key และเสี่ยงให้ค่าไปอยู่กับ image หรือ metadata",
      fix: "ฉีดจาก Secret Manager หรือ Fly secrets ตอน runtime แล้วหมุนค่าที่เคยเผยแพร่",
    },
    {
      title: "ปิด cold start ด้วย minimum อย่างเดียว",
      symptom: "ค่าใช้จ่ายเพิ่มแต่ช่วง burst ยังมี request แรกที่ช้า",
      fix: "วัด warm และ cold แยกกัน ดู startup trace และทดลองลดงาน initialize ก่อนปรับ minimum",
    },
  ],
  quiz: {
    questions: [
      mc("d143-q1", "เมื่อ Postgres จำเป็นแต่หลุดชั่วคราว แอป process ยังปกติ ควรตอบอย่างไร?", [
        ["ทั้งสอง route ตอบ 200", "จะซ่อนสถานะ dependency จากตัวตรวจ"],
        ["ทั้งสอง route ตอบ 503", "อาจกระตุ้นให้ platform restart process โดยไม่จำเป็น"],
        ["/healthz ตอบ 200 และ /readyz ตอบ 503", "แยกชีวิตโปรเซสจากความพร้อมทำงาน"],
        ["เฉพาะ /healthz ตอบ 503", "สลับความหมายของ probe"],
      ], "C", "ให้ process ที่ดีอยู่ต่อและให้ readiness สะท้อนว่า dependency ใช้งานไม่ได้", "dependency ล้ม คืน 503 ที่ route ไหน?", "/readyz"),
      mc("d143-q2", "ฉีด secret แบบ env ใน Cloud Run อย่างไรให้ startup ของ revision ใช้ค่าเดียวกัน?", [
        ["อ้าง version ที่ระบุ และให้ runtime identity อ่าน secret นั้น", "version คงค่าและสิทธิ์จำกัดขอบเขต"],
        ["เขียนค่าใน Dockerfile", "ทำให้ image ขนค่าไปทุก environment"],
        ["ใช้ token ของผู้ deploy เป็น credential ของแอป", "สิทธิ์คน deploy คนละหน้าที่กับ runtime"],
        ["print env ตอน startup", "เสี่ยงเผยค่าใน log"],
      ], "A", "pin version ใน secret reference และให้ service account ที่แอปใช้เข้าถึงเท่าที่ต้องการ", "ใครอ่าน secret ตอน startup?", "service account ที่ revision ใช้รัน"),
      mc("d143-q3", "ตั้ง minimum ให้หนึ่ง instance ผลที่ควรคาดคืออะไร?", [
        ["ทุก request ใช้เวลาคงที่", "เวลา dependency และ queue ยังเปลี่ยนได้"],
        ["scale เกินหนึ่งไม่ได้", "minimum ไม่ใช่ maximum"],
        ["ฐานข้อมูลไม่ต้องใช้ connection pool", "cold start และการใช้ connection เป็นคนละเรื่อง"],
        ["คำขอหลัง idle อาจดีขึ้น แต่ burst ยังอาจเปิด instance ใหม่", "minimum ช่วยคงกำลังไว้ตามจำนวนที่เลือก"],
      ], "D", "วัดเวลา first request และ warm requests เทียบกับค่าใช้จ่ายก่อนเลือก minimum", "เมื่อ traffic burst ยัง cold start ได้ไหม?", "ได้ เมื่อจำเป็นต้องเปิด instance เกินจำนวนที่อุ่น"),
      mc("d143-q4", "วิธีตรวจ Cloud Run candidate ก่อนรับ traffic หลักคืออะไร?", [
        ["ใช้ service URL เดิมอย่างเดียว", "URL นั้นอาจยังส่งไป revision เก่า"],
        ["deploy --no-traffic พร้อม tag แล้วเรียก tagged URL", "เข้าถึง candidate โดยตรงก่อนสลับ traffic"],
        ["ลบ baseline ทันที", "ทำให้สูญเสียเป้าหมาย rollback"],
        ["ดูแค่ image size", "ขนาดไม่บอกว่า route และ runtime config ใช้งานได้"],
      ], "B", "ทดสอบ candidate โดยตรงแล้วเลื่อน traffic เมื่อมีผลตรวจ", "tagged URL ช่วยอย่างไร?", "เรียก revision เฉพาะเจาะจงก่อนเปลี่ยน traffic หลัก"),
    ],
  },
  takeaways: [
    "แยก /healthz, /readyz และ startup probe ตามการตัดสินใจของ platform",
    "ใช้ runtime identity และ secret references และบันทึก digest กับ revision",
    "วัด cold และ warm จากการใช้งานจริงก่อนตั้งจำนวน instance ที่คงไว้",
    "ทดสอบ tagged candidate ก่อน rollout และเตรียม revision สำหรับ rollback",
  ],
  reviewCards: [
    rc("d143-health", "ทำไม liveness ไม่ควรพึ่งฐานข้อมูล?", "ฐานข้อมูลหลุดไม่ควรทำให้ process ที่ดี restart วน"),
    rc("d143-secrets", "secret env ของ Cloud Run ใช้ค่าคงที่ต่อ revision ได้อย่างไร?", "อ้างเลข version และให้สิทธิ์ runtime service account เฉพาะ secret ที่ใช้"),
    rc("d143-fly", "Fly HTTP service check ผูกกับอะไร?", "การ routing และ deployment ของ Machines โดยใช้พอร์ตกับ route ที่ตั้งไว้"),
    rc("d143-cold", "minimum ช่วยกับ request แบบไหน?", "ลดโอกาสรอเริ่ม instance สำหรับงานที่ใช้กำลังซึ่งอุ่นไว้แล้ว"),
    rc("d143-revision", "บันทึกอะไรเพื่อย้อน rollout?", "revision ก่อนหน้าและ candidate พร้อมสัดส่วน traffic, digest และผล smoke"),
  ],
  sources: [
    { label: "Cloud Run · Configure health checks", href: "https://docs.cloud.google.com/run/docs/configuring/healthchecks" },
    { label: "Cloud Run · Configure secrets", href: "https://docs.cloud.google.com/run/docs/configuring/services/secrets" },
    { label: "Cloud Run · Rollouts and traffic migration", href: "https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration" },
    { label: "Cloud Run · Minimum instances", href: "https://docs.cloud.google.com/run/docs/configuring/min-instances" },
    { label: "Fly.io · Health checks", href: "https://docs.fly.io/reference/health-checks" },
    { label: "Fly.io · Secrets", href: "https://docs.fly.io/apps/secrets" },
  ],
  glossary: ["dockerfile", "env-config", "fastapi", "langfuse", "otel", "sse"],
});
